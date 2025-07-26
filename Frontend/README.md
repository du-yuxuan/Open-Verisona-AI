# 多智能体标签协同系统 API 接入指南

## 简介

本项目是一个基于多智能体协作的标签分析系统。通过模拟不同领域的专家（如数据分析师、心理学家、策略专家），从多个维度对用户标签进行深度分析和评估，最终筛选出最具价值和优先级的标签。

该系统使用 FastAPI 构建后端服务，并利用 `camel-ai` 库实现多智能体对话与协作。

## 环境准备与安装

在开始之前，请确保您已安装 Python 3.8+。

1.  **克隆项目**
    ```bash
    git clone <your-repo-url>
    cd <project-directory>
    ```

2.  **安装依赖**
    项目依赖项在 `requirements.txt` 文件中。请运行以下命令安装：
    ```bash
    pip install -r requirements.txt
    ```
    *注意：如果项目中没有 `requirements.txt` 文件，请根据 `main.py` 中的 `import` 语句手动安装所需库，主要包括 `fastapi`, `uvicorn`, `python-dotenv`, `camel-ai`, `sqlalchemy` 等。*

3.  **配置环境变量**
    本项目使用 `.env` 文件来管理环境变量。请在项目根目录创建一个 `.env` 文件，并根据需要配置以下变量：

    ```env
    # 模拟模式：如果为 "true"，系统将使用模拟数据进行分析，无需调用外部AI模型。
    # 如果为 "false"，系统将尝试连接并使用在 main.py 中配置的真实AI模型。
    SIMULATION_MODE="true"

    # (可选) 如果不使用模拟模式，请提供您的 OpenAI API 密钥
    # OPENAI_API_KEY="your-openai-api-key"

    # 数据库连接URL
    # 默认为 SQLite 数据库
    DATABASE_URL="sqlite:///./tags.db"
    ```

## 启动服务

使用 `uvicorn` 启动 FastAPI 应用。在项目根目录下运行：

```bash
python start_server.py
```

或者直接使用 uvicorn 命令：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后，您可以在 `http://localhost:8000` 访问 API。

## API 端点说明

### 1. 标签分析

这是系统的核心功能接口，用于接收用户画像和标签数据，并通过多智能体协同分析返回优先级最高的标签。

-   **URL**: `/analyze-tags`
-   **Method**: `POST`
-   **Content-Type**: `application/json`

#### 请求体 (`TagAnalysisRequest`)

| 字段 | 类型 | 描述 | 是否必须 |
| :--- | :--- | :--- | :--- |
| `user_profile` | `UserProfile` | 用户的详细档案信息 | 是 |
| `max_tags` | `integer` | 希望返回的最大标签数量，默认为 10 | 否 |
| `analysis_depth` | `string` | 分析深度，可选值为 "standard", "deep", "quick"，默认为 "standard" | 否 |

#### `UserProfile` 对象结构

| 字段 | 类型 | 描述 | 是否必须 |
| :--- | :--- | :--- | :--- |
| `user_id` | `string` | 唯一用户标识符 | 是 |
| `name` | `string` | 用户姓名 | 是 |
| `tags` | `array` | 用户拥有的标签列表，每个元素为 `TagData` 对象 | 是 |
| `context` | `string` | 用户的背景信息或上下文描述 | 否 |

#### `TagData` 对象结构

| 字段 | 类型 | 描述 | 是否必须 |
| :--- | :--- | :--- | :--- |
| `tag_id` | `string` | 唯一标签标识符 | 是 |
| `tag_name` | `string` | 标签名称 | 是 |
| `category` | `string` | 标签所属类别 | 是 |
| `description` | `string` | 标签的详细描述 | 是 |
| `relevance_score` | `float` | 标签的原始相关性评分，默认为 0.0 | 否 |

#### 请求示例

```json
{
  "user_profile": {
    "user_id": "user_001",
    "name": "张三",
    "context": "25岁软件工程师，喜欢科技产品，经常在线购物，关注健康生活",
    "tags": [
      {
        "tag_id": "tech_001",
        "tag_name": "科技爱好者",
        "category": "兴趣爱好",
        "description": "对最新科技产品和趋势感兴趣",
        "relevance_score": 8.5
      },
      {
        "tag_id": "work_001",
        "tag_name": "软件开发者",
        "category": "职业技能",
        "description": "具备软件开发技能，熟悉编程语言",
        "relevance_score": 9.2
      }
    ]
  },
  "max_tags": 5,
  "analysis_depth": "standard"
}
```

#### 响应体 (`AnalysisResponse`)

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `user_id` | `string` | 用户的唯一标识符 |
| `selected_tags` | `array` | 经过分析和排序后的标签列表，每个元素为 `TagResult` 对象 |
| `analysis_summary` | `string` | 对本次分析的总结性描述 |
| `agent_discussions` | `array` | 各智能体的讨论记录 |

#### `TagResult` 对象结构

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `tag_id` | `string` | 标签的唯一标识符 |
| `tag_name` | `string` | 标签名称 |
| `priority_score` | `float` | 经过多智能体评估后的最终优先级评分 |
| `reasoning` | `string` | 该评分的理由和分析过程 |
| `agent_consensus` | `float` | 智能体之间的共识度（0到1之间） |

#### 响应示例

```json
{
  "user_id": "user_001",
  "selected_tags": [
    {
      "tag_id": "work_001",
      "tag_name": "软件开发者",
      "priority_score": 9.5,
      "reasoning": "综合三位专家意见，平均评分9.5分，专家共识度0.95",
      "agent_consensus": 0.95
    },
    {
      "tag_id": "tech_001",
      "tag_name": "科技爱好者",
      "priority_score": 8.8,
      "reasoning": "综合三位专家意见，平均评分8.8分，专家共识度0.90",
      "agent_consensus": 0.90
    }
  ],
  "analysis_summary": "经过多智能体协商讨论，从2个标签中选出了2个最重要的标签",
  "agent_discussions": [
    {
      "agent": "analyst",
      "analysis": "数据分析师：基于统计学和数据挖掘方法进行标签重要性评估..."
    },
    {
      "agent": "psychologist",
      "analysis": "心理学家：从用户行为心理学角度分析标签的心理价值..."
    }
  ]
}
```

### 2. 健康检查

用于检查服务是否正常运行。

-   **URL**: `/health`
-   **Method**: `GET`

#### 响应示例

```json
{
  "status": "healthy",
  "service": "multi-agent-tag-analyzer"
}
```

### 3. 根路径

返回 API 的基本信息。

-   **URL**: `/`
-   **Method**: `GET`

#### 响应示例

```json
{
  "message": "多智能体标签协同系统 API",
  "version": "1.0.0"
}
```

## 测试

项目提供了一个测试脚本 `test_example.py`，用于验证 API 的功能。

1.  **确保服务正在运行**
    请先按照“启动服务”部分的说明启动 API 服务。

2.  **运行测试脚本**
    在另一个终端中，运行以下命令：
    ```bash
    python test_example.py
    ```

脚本将首先进行健康检查，然后发送一个示例标签分析请求，并打印出详细的请求和响应信息。这可以帮助您快速了解 API 的使用方法。
