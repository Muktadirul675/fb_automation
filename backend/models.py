from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timedelta
from enum import Enum

class Status(str, Enum):
    pending = "Pending"
    error = "Error"
    queued = "Queued"
    success = "Success"
    running = "Running"
    published =  "Published"
    
class MediaType(str, Enum):
    image = "Image"
    video = "Video"
    gif = "GIF"
    link = "Link"

class ReactionType(str, Enum):
    like = "Like"
    love = "Love"
    care = "Care"
    angry = "Angry"
    haha = "Haha"
    sad = "Sad"
    random = "Random"
    
class PostTarget(str, Enum):
    page = "Page"
    group = "Group"
    
def default_expiry():
    return datetime.utcnow() + timedelta(days=60)

class CommentProcessUserLink(SQLModel, table=True):
    comment_process_id: Optional[int] = Field(default=None, foreign_key="commentprocess.id", primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)

class ReactionProcessUserLink(SQLModel, table=True):
    reaction_process_id: Optional[int] = Field(default=None, foreign_key="reactionprocess.id", primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    picture: Optional[str] = None
    fb_id: str
    email: str
    access_token: str
    expiry : datetime = Field(default_factory=default_expiry)
    is_admin: bool = False

    post_processes_authors : List["PostProcess"] = Relationship(back_populates="author")
    comment_processes_authors : List["CommentProcess"] = Relationship(back_populates="author")
    reaction_processes_authors : List["ReactionProcess"] = Relationship(back_populates="author")

    comment_processes: List["CommentProcess"] = Relationship(back_populates="users", link_model=CommentProcessUserLink)
    reaction_processes: List["ReactionProcess"] = Relationship(back_populates="users", link_model=ReactionProcessUserLink)
    
    groups: List["Group"] = Relationship(back_populates="admin")  # Could be a JSON list or normalized
    pages: List["Page"] = Relationship(back_populates="admin")

    # posts: List["Post"] = Relationship(back_populates="user")
    comments: List["Comment"] = Relationship(back_populates="user")
    reactions: List["Reaction"] = Relationship(back_populates="user")
    
class PostProcessGroupLink(SQLModel, table=True):
    post_process_id: Optional[int] = Field(default=None, foreign_key="postprocess.id", primary_key=True)
    group_id: Optional[int] = Field(default=None, foreign_key="group.id", primary_key=True)

class PostProcessPageLink(SQLModel, table=True):
    post_process_id: Optional[int] = Field(default=None, foreign_key="postprocess.id", primary_key=True)
    page_id: Optional[int] = Field(default=None, foreign_key="page.id", primary_key=True)

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name : str
    fbid : str
    admin_id: Optional[int] = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    admin: Optional[User] = Relationship(back_populates="groups")
    post_processes: List["PostProcess"] = Relationship(back_populates="groups",link_model=PostProcessGroupLink)
    
class Page(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name : str
    fbid : str
    access_token : str
    admin_id: Optional[int] = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    admin: Optional[User] = Relationship(back_populates="pages")
    post_processes: List["PostProcess"] = Relationship(back_populates="pages",link_model=PostProcessPageLink)

class PostProcess(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    name : str
    interval: Optional[int] = None
    interval_range_start: Optional[int] = None
    interval_range_end: Optional[int] = None
    use_ai: bool = False
    ai_model : str | None = None
    status: Status = Status.pending

    author_id: Optional[int] = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    author: Optional[User] = Relationship(back_populates="post_processes_authors")

    medias: List["Media"] = Relationship(back_populates="process")
    posts: List["Post"] = Relationship(back_populates="process")

    groups: List["Group"] = Relationship(back_populates="post_processes",link_model=PostProcessGroupLink)
    pages: List["Page"] = Relationship(back_populates="post_processes",link_model=PostProcessPageLink)

    proxy_id : int | None = Field(default=None, foreign_key="proxy.id", ondelete="SET NULL")
    proxy : Optional["Proxy"] = Relationship(back_populates="post_processes")
    
    created_at : datetime = Field(default_factory=datetime.utcnow)
    
class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)  
    scheduled_for: Optional[datetime] = None
    target: PostTarget
    target_id: str
    fb_id: Optional[str] = None
    text : str = ""
    message : str | None = None
    access_token : str
    status : Status = Status.pending
    process_id : Optional[int] = Field(foreign_key="postprocess.id", ondelete="SET NULL")
    process : PostProcess = Relationship(back_populates="posts")
    medias: List["Media"] = Relationship(back_populates="post")
    published_at : datetime | None = None
    
    proxy_id : int | None = Field(default=None, foreign_key="proxy.id", ondelete="SET NULL")
    proxy : Optional["Proxy"] = Relationship(back_populates="posts")
    
    created_at : datetime = Field(default_factory=datetime.utcnow)

class Media(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str
    type_of : MediaType
    process_id: Optional[int] = Field(default=None, foreign_key="postprocess.id", ondelete="SET NULL")
    post_id: Optional[int] = Field(default=None, foreign_key="post.id", ondelete="SET NULL")
    
    process: Optional[PostProcess] = Relationship(back_populates="medias")
    post: Optional[Post] = Relationship(back_populates="medias")
    
    created_at : datetime = Field(default_factory=datetime.utcnow)
    published_at : datetime | None = None
    
class CommentProcess(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    scheduled_for: Optional[datetime] = None
    name : str
    interval: Optional[int] = None
    interval_range_start: Optional[int] = None
    interval_range_end: Optional[int] = None
    created_at : datetime = Field(default_factory=datetime.utcnow)
    status : Status = Status.pending
    author_id: Optional[int] = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    author: Optional[User] = Relationship(back_populates="comment_processes_authors")
    
    users: List["User"] = Relationship(back_populates="comment_processes", link_model=CommentProcessUserLink)
    
    text : str
    use_ai : bool = Field(default=False)
    post_id : str
    comments : List["Comment"] = Relationship(back_populates="process")
    
class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text : str
    use_ai : bool = Field(default=False)
    post_id: str 
    fb_id: Optional[str] = None
    message : str | None = None
    status : Status = Status.pending
    process_id: Optional[int] = Field(default=None, foreign_key="commentprocess.id", ondelete="SET NULL")
    process : Optional[CommentProcess] = Relationship(back_populates="comments")
    created_at : datetime = Field(default_factory=datetime.utcnow)
    published_at : datetime | None = None
    user_id : Optional[int] = Field(default=None, foreign_key="user.id", ondelete='SET NULL')
    user : Optional[User] = Relationship(back_populates="comments")
    scheduled_for: Optional[datetime] = None
    
class ReactionProcess(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    scheduled_for: Optional[datetime] = None
    name : str
    interval: Optional[int] = None
    interval_range_start: Optional[int] = None
    interval_range_end: Optional[int] = None
    created_at : datetime = Field(default_factory=datetime.utcnow)
    status : Status = Status.pending
    post_id : str
    type_of : ReactionType = ReactionType.like
    
    author_id: Optional[int] = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    author: Optional[User] = Relationship(back_populates="reaction_processes_authors")
    
    users: List["User"] = Relationship(back_populates="reaction_processes", link_model=ReactionProcessUserLink)
    
    reactions: List["Reaction"] = Relationship(back_populates="process")
    
class Reaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type_of : ReactionType = ReactionType.like
    status : Status = Status.pending
    message : str | None = None
    post_id : str
    created_at : datetime = Field(default_factory=datetime.utcnow)
    published_at : datetime | None = None
    user_id : Optional[int] = Field(default=None, foreign_key="user.id", ondelete='SET NULL')
    user : Optional[User] = Relationship(back_populates="reactions")
    process_id: Optional[int] = Field(default=None, foreign_key="reactionprocess.id", ondelete="SET NULL")
    process: Optional[ReactionProcess] = Relationship(back_populates="reactions")
    scheduled_for: Optional[datetime] = None

class Proxy(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hostname : str 
    port : int
    password : str
    active : bool = Field(default=True)
    
    posts : List[Post] = Relationship(back_populates="proxy")
    # comments : List[Commemt] = Relationship(back_populates="proxy")
    # reactions : List[Reaction] = Relationship(back_populates="proxy")
    post_processes : List[PostProcess] = Relationship(back_populates="proxy")
    # comment_processes : List[CommentProcess] = Relationship(back_populates="proxy")
    # reaction_processes : List[ReactionProcess] = Relationship(back_populates="proxy")
