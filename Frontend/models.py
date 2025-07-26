from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional

Base = declarative_base()

class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    context = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    tags = relationship("UserTag", back_populates="user")
    analyses = relationship("TagAnalysis", back_populates="user")

class Tag(Base):
    """标签表"""
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(String(50), unique=True, index=True, nullable=False)
    tag_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user_tags = relationship("UserTag", back_populates="tag")
    analysis_results = relationship("TagAnalysisResult", back_populates="tag")

class UserTag(Base):
    """用户标签关联表"""
    __tablename__ = "user_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
    relevance_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="tags")
    tag = relationship("Tag", back_populates="user_tags")

class TagAnalysis(Base):
    """标签分析记录表"""
    __tablename__ = "tag_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_summary = Column(Text, nullable=True)
    max_tags = Column(Integer, default=10)
    analysis_depth = Column(String(20), default="standard")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="analyses")
    results = relationship("TagAnalysisResult", back_populates="analysis")
    discussions = relationship("AgentDiscussion", back_populates="analysis")

class TagAnalysisResult(Base):
    """标签分析结果表"""
    __tablename__ = "tag_analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("tag_analyses.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
    priority_score = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=True)
    agent_consensus = Column(Float, default=0.5)
    rank_position = Column(Integer, nullable=False)
    
    # 关系
    analysis = relationship("TagAnalysis", back_populates="results")
    tag = relationship("Tag", back_populates="analysis_results")

class AgentDiscussion(Base):
    """智能体讨论记录表"""
    __tablename__ = "agent_discussions"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("tag_analyses.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)
    agent_role = Column(String(100), nullable=True)
    discussion_content = Column(Text, nullable=False)
    analysis_result = Column(Text, nullable=True)  # JSON格式的分析结果
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    analysis = relationship("TagAnalysis", back_populates="discussions")

class SystemLog(Base):
    """系统日志表"""
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    log_level = Column(String(20), nullable=False)  # INFO, WARNING, ERROR
    message = Column(Text, nullable=False)
    module = Column(String(50), nullable=True)
    user_id = Column(String(50), nullable=True)
    request_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 数据库工具函数
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

def get_database_url():
    """获取数据库URL"""
    return os.getenv("DATABASE_URL", "sqlite:///./tags.db")

def create_database_engine():
    """创建数据库引擎"""
    database_url = get_database_url()
    
    if database_url.startswith("sqlite"):
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(database_url)
    
    return engine

def create_tables():
    """创建所有表"""
    engine = create_database_engine()
    Base.metadata.create_all(bind=engine)
    return engine

def get_session_maker():
    """获取会话制造器"""
    engine = create_database_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal

# 依赖注入函数
def get_db():
    """获取数据库会话"""
    SessionLocal = get_session_maker()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    # 创建表
    print("创建数据库表...")
    engine = create_tables()
    print(f"数据库表创建完成: {get_database_url()}")