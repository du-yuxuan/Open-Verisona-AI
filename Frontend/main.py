from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import json
from camel.agents import ChatAgent
from camel.messages import BaseMessage
from camel.models import ModelFactory
from camel.types import ModelPlatformType, ModelType
from camel.configs import ChatGPTConfig
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = FastAPI(title="多智能体标签协同系统", version="1.0.0")

# 数据模型
class TagData(BaseModel):
    tag_id: str
    tag_name: str
    category: str
    description: str
    relevance_score: float = 0.0

class UserProfile(BaseModel):
    user_id: str
    name: str
    tags: List[TagData]
    context: Optional[str] = None

class TagAnalysisRequest(BaseModel):
    user_profile: UserProfile
    max_tags: int = 10
    analysis_depth: str = "standard"  # standard, deep, quick

class SimpleTagAnalysisRequest(BaseModel):
    tags: List[str]  # 简单的标签文字列表
    max_tags: int = 5
    user_id: Optional[str] = "user_001"  # 可选的用户ID

class TagResult(BaseModel):
    tag_id: str
    tag_name: str
    priority_score: float
    reasoning: str
    agent_consensus: float

class AnalysisResponse(BaseModel):
    user_id: str
    selected_tags: List[TagResult]
    analysis_summary: str
    agent_discussions: List[Dict]

# 多智能体系统类
class MultiAgentTagAnalyzer:
    def __init__(self):
        # 配置模型
        self.model_config = ChatGPTConfig(
            temperature=0.7,
            max_tokens=1000
        )

        # 检查是否启用模拟模式
        self.simulation_mode = os.getenv("SIMULATION_MODE", "true").lower() == "true"

        # 创建不同角色的智能体（如果不是模拟模式）
        if not self.simulation_mode:
            try:
                self.agents = self._create_agents()
            except Exception as e:
                print(f"创建智能体失败，切换到模拟模式: {e}")
                self.simulation_mode = True
                self.agents = None
        else:
            print("运行在模拟模式下")
            self.agents = None

    def _create_agents(self):
        """创建不同角色的智能体"""
        model = ModelFactory.create(
            model_platform=ModelPlatformType.OPENAI,
            model_type=ModelType.GPT_4O,
            model_config_dict=self.model_config.__dict__
        )

        agents = {
        }

        return agents

    async def analyze_tags(self, user_profile: UserProfile, max_tags: int = 10) -> AnalysisResponse:
        """多智能体协同分析标签"""
        try:
            # 准备分析数据
            tags_info = self._prepare_tags_info(user_profile)

            # 各智能体独立分析
            agent_analyses = await self._conduct_individual_analysis(tags_info, user_profile)

            # 智能体协商讨论
            consensus_results = await self._conduct_consensus_discussion(agent_analyses, user_profile, max_tags)

            # 生成最终结果
            final_results = self._generate_final_results(consensus_results, user_profile, max_tags)

            return final_results

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"分析过程中出现错误: {str(e)}")

    def _prepare_tags_info(self, user_profile: UserProfile) -> str:
        """准备标签信息"""
        tags_text = "\n".join([
            f"标签ID: {tag.tag_id}, 名称: {tag.tag_name}, 类别: {tag.category}, "
            f"描述: {tag.description}, 相关性: {tag.relevance_score}"
            for tag in user_profile.tags
        ])

        context = f"""
用户信息:
- 用户ID: {user_profile.user_id}
- 姓名: {user_profile.name}
- 背景信息: {user_profile.context or '无'}

用户标签列表:
{tags_text}
        """

        return context

    async def _conduct_individual_analysis(self, tags_info: str, user_profile: UserProfile) -> Dict:
        """各智能体独立分析"""
        if self.simulation_mode:
            return self._simulate_individual_analysis(user_profile)

        analyses = {}

        for agent_name, agent in self.agents.items():
            prompt = f"""
请分析以下用户的标签数据，从你的专业角度评估每个标签的重要性：

{tags_info}

请为每个标签提供：
1. 重要性评分 (1-10分)
2. 评估理由
3. 从你的专业角度的独特见解

请以JSON格式返回结果，格式如下：
{{
    "analysis": [
        {{
            "tag_id": "标签ID",
            "score": 评分,
            "reasoning": "评估理由",
            "professional_insight": "专业见解"
        }}
    ],
    "overall_assessment": "整体评估"
}}
            """

            try:
                response = agent.step(BaseMessage.make_user_message(
                    role_name="用户",
                    content=prompt
                ))

                # 解析响应
                content = response.msg.content
                # 尝试提取JSON部分
                if "```json" in content:
                    json_start = content.find("```json") + 7
                    json_end = content.find("```", json_start)
                    json_content = content[json_start:json_end].strip()
                else:
                    json_content = content

                # 修复不完整的JSON字符串
                if '...' in json_content or not json_content.strip().endswith('}'):
                    # 移除末尾的 '...' 和多余的字符
                    json_content = json_content.split('...')[0].strip()

                    # 移除最后一个可能不完整的条目
                    last_comma = json_content.rfind(',')
                    if last_comma > json_content.rfind('{') and last_comma > json_content.rfind('['):
                        json_content = json_content[:last_comma]

                    # 尝试闭合所有打开的括号
                    open_brackets = json_content.count('{') - json_content.count('}')
                    open_sq_brackets = json_content.count('[') - json_content.count(']')
                    json_content += ']' * open_sq_brackets + '}' * open_brackets

                    # 最后的保障措施，确保至少是一个有效的JSON对象
                    try:
                        json.loads(json_content)
                    except json.JSONDecodeError:
                        # 如果修复失败，则提供一个表示错误的有效JSON
                        json_content = '{"analysis": [], "overall_assessment": "Failed to parse model output."}'

                analyses[agent_name] = {
                    "raw_response": content,
                    "parsed_analysis": json.loads(json_content)
                }

            except Exception as e:
                print(f"智能体 {agent_name} 分析失败: {e}")
                analyses[agent_name] = {
                    "raw_response": f"分析失败: {str(e)}",
                    "parsed_analysis": {"analysis": [], "overall_assessment": "分析失败"}
                }

        return analyses

    async def _conduct_consensus_discussion(self, agent_analyses: Dict, user_profile: UserProfile, max_tags: int) -> Dict:
        """智能体协商讨论"""
        if self.simulation_mode:
            return self._simulate_consensus_discussion(agent_analyses, user_profile, max_tags)

        # 汇总各智能体的分析结果
        summary = self._summarize_analyses(agent_analyses)

        # 进行协商讨论
        discussion_prompt = f"""
基于以下各专家的分析结果，请进行协商讨论，确定最终的标签优先级：

{summary}

请考虑：
1. 各专家观点的合理性
2. 标签的综合重要性
3. 用户画像的完整性
4. 实际应用价值

请选出前{max_tags}个最重要的标签，并为每个标签提供：
- 最终优先级评分 (1-10)
- 综合评估理由
- 专家共识度 (0-1)

请以JSON格式返回结果。
        """

        # 使用分析师智能体进行最终协商
        try:
            response = self.agents["analyst"].step(BaseMessage.make_user_message(
                role_name="协调员",
                content=discussion_prompt
            ))

            content = response.msg.content
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
            else:
                json_content = content

            consensus = json.loads(json_content)

        except Exception as e:
            print(f"协商讨论失败: {e}")
            consensus = {"selected_tags": [], "discussion_summary": "协商失败"}

        return {
            "individual_analyses": agent_analyses,
            "consensus_result": consensus
        }

    def _simulate_individual_analysis(self, user_profile: UserProfile) -> Dict:
        """模拟各智能体独立分析"""
        import random

        analyses = {}

        # 模拟数据分析师的分析
        analyst_analysis = []
        for tag in user_profile.tags:
            # 基于相关性评分和类别进行模拟评分
            base_score = tag.relevance_score
            # 数据分析师更关注数据相关性
            if tag.category in ["行为", "偏好", "数据"]:
                score = min(10, base_score * 1.2 + random.uniform(0.5, 1.5))
            else:
                score = min(10, base_score + random.uniform(0, 1))

            analyst_analysis.append({
                "tag_id": tag.tag_id,
                "score": round(score, 1),
                "reasoning": f"基于数据相关性分析，该标签在{tag.category}类别中具有{score:.1f}分的重要性",
                "professional_insight": "从数据驱动角度，此标签对用户画像构建有重要价值"
            })

        analyses["analyst"] = {
            "raw_response": "数据分析师：基于统计学和数据挖掘方法进行标签重要性评估",
            "parsed_analysis": {
                "analysis": analyst_analysis,
                "overall_assessment": "从数据角度看，用户标签体系较为完整"
            }
        }

        # 模拟心理学家的分析
        psychologist_analysis = []
        for tag in user_profile.tags:
            base_score = tag.relevance_score
            # 心理学家更关注心理和行为标签
            if tag.category in ["心理", "性格", "情感", "行为"]:
                score = min(10, base_score * 1.3 + random.uniform(0.5, 2))
            else:
                score = min(10, base_score + random.uniform(-0.5, 1))

            psychologist_analysis.append({
                "tag_id": tag.tag_id,
                "score": round(score, 1),
                "reasoning": f"从心理学角度，{tag.tag_name}反映了用户的{tag.category}特征",
                "professional_insight": "此标签对理解用户心理动机具有重要意义"
            })

        analyses["psychologist"] = {
            "raw_response": "心理学家：从用户行为心理学角度分析标签的心理价值",
            "parsed_analysis": {
                "analysis": psychologist_analysis,
                "overall_assessment": "用户心理画像标签具有良好的代表性"
            }
        }

        # 模拟策略专家的分析
        strategist_analysis = []
        for tag in user_profile.tags:
            base_score = tag.relevance_score
            # 策略专家更关注商业价值
            if tag.category in ["消费", "偏好", "行为", "兴趣"]:
                score = min(10, base_score * 1.1 + random.uniform(1, 2))
            else:
                score = min(10, base_score + random.uniform(0, 1.5))

            strategist_analysis.append({
                "tag_id": tag.tag_id,
                "score": round(score, 1),
                "reasoning": f"从商业策略角度，{tag.tag_name}具有{score:.1f}分的应用价值",
                "professional_insight": "此标签在精准营销和用户运营中具有实用价值"
            })

        analyses["strategist"] = {
            "raw_response": "策略专家：从商业应用和实用性角度评估标签价值",
            "parsed_analysis": {
                "analysis": strategist_analysis,
                "overall_assessment": "标签体系具有良好的商业应用潜力"
            }
        }

        return analyses

    def _simulate_consensus_discussion(self, agent_analyses: Dict, user_profile: UserProfile, max_tags: int) -> Dict:
        """模拟协商讨论"""
        # 收集所有标签的评分
        tag_scores = {}

        for agent_name, analysis in agent_analyses.items():
            for tag_analysis in analysis["parsed_analysis"]["analysis"]:
                tag_id = tag_analysis["tag_id"]
                if tag_id not in tag_scores:
                    tag_scores[tag_id] = []
                tag_scores[tag_id].append(tag_analysis["score"])

        # 计算综合评分
        final_tags = []
        for tag in user_profile.tags:
            if tag.tag_id in tag_scores:
                scores = tag_scores[tag.tag_id]
                avg_score = sum(scores) / len(scores)
                consensus_score = 1.0 - (max(scores) - min(scores)) / 10  # 评分差异越小，共识度越高

                final_tags.append({
                    "tag_id": tag.tag_id,
                    "tag_name": tag.tag_name,
                    "score": round(avg_score, 1),
                    "reasoning": f"综合三位专家意见，平均评分{avg_score:.1f}分，专家共识度{consensus_score:.2f}",
                    "consensus": round(consensus_score, 2)
                })

        # 按评分排序并选择前N个
        final_tags.sort(key=lambda x: x["score"], reverse=True)
        selected_tags = final_tags[:max_tags]

        consensus_result = {
            "selected_tags": selected_tags,
            "discussion_summary": f"经过多智能体协商讨论，从{len(user_profile.tags)}个标签中选出了{len(selected_tags)}个最重要的标签"
        }

        return {
            "individual_analyses": agent_analyses,
            "consensus_result": consensus_result
        }

    def _summarize_analyses(self, agent_analyses: Dict) -> str:
        """汇总分析结果"""
        summary = "各专家分析结果汇总：\n\n"

        for agent_name, analysis in agent_analyses.items():
            summary += f"=== {agent_name.upper()} 专家分析 ==="
            summary += f"原始回复: {analysis['raw_response'][:500]}...\n\n"

        return summary

    def _generate_final_results(self, consensus_results: Dict, user_profile: UserProfile, max_tags: int) -> AnalysisResponse:
        """生成最终结果"""
        try:
            consensus = consensus_results["consensus_result"]
            selected_tags = []

            # 处理选中的标签
            if "selected_tags" in consensus:
                for tag_info in consensus["selected_tags"][:max_tags]:
                    selected_tags.append(TagResult(
                        tag_id=tag_info.get("tag_id", ""),
                        tag_name=tag_info.get("tag_name", ""),
                        priority_score=float(tag_info.get("score", 0)),
                        reasoning=tag_info.get("reasoning", ""),
                        agent_consensus=float(tag_info.get("consensus", 0.5))
                    ))

            # 如果没有成功解析，使用备用方案
            if not selected_tags:
                # 基于原始标签的相关性评分进行排序
                sorted_tags = sorted(user_profile.tags, key=lambda x: x.relevance_score, reverse=True)
                for i, tag in enumerate(sorted_tags[:max_tags]):
                    selected_tags.append(TagResult(
                        tag_id=tag.tag_id,
                        tag_name=tag.tag_name,
                        priority_score=tag.relevance_score,
                        reasoning="基于原始相关性评分",
                        agent_consensus=0.5
                    ))

            # 生成讨论记录
            discussions = []
            for agent_name, analysis in consensus_results["individual_analyses"].items():
                discussions.append({
                    "agent": agent_name,
                    "analysis": analysis["raw_response"][:200] + "..."
                })

            return AnalysisResponse(
                user_id=user_profile.user_id,
                selected_tags=selected_tags,
                analysis_summary=consensus.get("discussion_summary", "多智能体协同分析完成"),
                agent_discussions=discussions
            )

        except Exception as e:
            print(f"生成最终结果失败: {e}")
            # 返回备用结果
            return AnalysisResponse(
                user_id=user_profile.user_id,
                selected_tags=[],
                analysis_summary=f"分析过程中出现错误: {str(e)}",
                agent_discussions=[]
            )

    def create_user_profile_from_tags(self, tag_strings: List[str], user_id: str = "user_001") -> UserProfile:
        """从字符串列表创建用户档案"""
        tags = []
        for i, tag_name in enumerate(tag_strings):
            tags.append(TagData(
                tag_id=f"tag_{i+1:03d}",
                tag_name=tag_name,
                category="通用",
                description=f"用户标签: {tag_name}",
                relevance_score=8.0  # 默认相关性评分
            ))

        return UserProfile(
            user_id=user_id,
            name=f"用户_{user_id}",
            tags=tags,
            context="基于简化标签输入生成的用户档案"
        )

# 创建全局分析器实例
analyzer = MultiAgentTagAnalyzer()

@app.get("/")
async def root():
    return {"message": "多智能体标签协同系统 API", "version": "1.0.0"}

@app.post("/analyze-tags", response_model=AnalysisResponse)
async def analyze_user_tags(request: TagAnalysisRequest):
    """
    分析用户标签并确定优先级

    通过多智能体协同讨论，从不同专业角度分析用户标签，
    筛选出最重要的标签并确定优先级。
    """
    try:
        result = await analyzer.analyze_tags(
            user_profile=request.user_profile,
            max_tags=request.max_tags
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-simple-tags", response_model=AnalysisResponse)
async def analyze_simple_tags(request: SimpleTagAnalysisRequest):
    """
    简化版标签分析接口

    输入：标签文字的字符串列表
    输出：筛选后的优先级标签

    这是一个简化的接口，只需要传入标签文字列表，
    系统会自动创建用户档案并进行多智能体分析。
    """
    try:
        # 从字符串列表创建用户档案
        user_profile = analyzer.create_user_profile_from_tags(
            tag_strings=request.tags,
            user_id=request.user_id
        )

        # 进行标签分析
        result = await analyzer.analyze_tags(
            user_profile=user_profile,
            max_tags=request.max_tags
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "multi-agent-tag-analyzer"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
