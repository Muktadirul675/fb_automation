export interface PaginationState<T> {
    currentPage: number;
    totalCount: number;
    limit: number;
    totalPages: number;
    data: T[];
    cache: Record<number, T[]>;
}


export enum Status {
    pending = "Pending",
    error = "Error",
    queued = "Queued",
    success = "Success",
    published = "Published",
    running = "Running"
}

export enum MediaType {
    image = "Image",
    video = "Video",
    gif = "GIF",
    link = "Link",
}

export enum ReactionType {
    like = "Like",
    love = "Love",
    care = "Care",
    angry = "Angry",
    haha = "Haha",
    sad = "Sad",
    random = "Random",
}

export enum PostTarget {
    page = "Page",
    group = "Group",
}

export interface User {
    id?: number;
    name: string;
    picture?: string;
    fb_id: string;
    email: string;
    access_token: string;
    expiry: string;
    is_admin: boolean;

    post_processes_authors?: PostProcess[];
    comment_processes_authors?: CommentProcess[];
    reaction_processes_authors?: ReactionProcess[];

    comment_processes?: CommentProcess[];
    reaction_processes?: ReactionProcess[];

    groups?: Group[];
    pages?: Page[];

    comments?: Comment[];
    reactions?: Reaction[];

    group_count: number,
    page_count: number,
    total_reactions: number,
    total_comments: number,
}

export interface Group {
    id?: number;
    name: string;
    fbid: string;
    admin_id?: number;
    admin?: User;
    post_processes?: PostProcess[];
}

export interface Page {
    id?: number;
    name: string;
    fbid: string;
    access_token: string;
    admin_id?: number;
    admin?: User;
    post_processes?: PostProcess[];
}

export interface PostProcess {
    id?: number;
    text?: string;
    scheduled_for?: string;
    name: string;
    interval?: number;
    interval_range_start?: number;
    interval_range_end?: number;
    use_ai: boolean;
    ai_model : string | null;
    status: Status;
    created_at: string;

    author_id?: number;
    author?: User;

    medias?: Media[];
    posts?: Post[];

    groups?: Group[];
    pages?: Page[];
}

export interface Post {
    id?: number;
    scheduled_for?: string;
    target: PostTarget;
    target_id: string;
    fb_id?: string;
    text: string
    message?: string;
    access_token: string;
    status: Status;
    process_id?: number;
    process?: PostProcess;
    medias?: Media[];
    published_at?: string;
    created_at: string;
    group?: Group,
    page?: Group,
}

export interface Media {
    id?: number;
    url: string;
    type_of: MediaType;
    process_id?: number;
    post_id?: number;

    process?: PostProcess;
    post?: Post;
    created_at: string;
    published_at?: string;
}

export interface CommentProcess {
    id?: number;
    scheduled_for?: string;
    name: string;
    interval?: number;
    interval_range_start?: number;
    interval_range_end?: number;
    created_at: string;
    status: Status;

    author_id?: number;
    author?: User;

    users?: User[];

    text: string;
    use_ai: boolean;
    post_id: string;
    comments?: Comment[];
}

export interface Comment {
    id?: number;
    text: string;
    use_ai: boolean;
    post_id: string;
    fb_id?: string;
    message?: string;
    status: Status;
    process_id?: number;
    process?: CommentProcess;
    created_at: string;
    published_at?: string;
    user_id?: number;
    user?: User;
    scheduled_for?: string;
}

export interface ReactionProcess {
    id?: number;
    scheduled_for?: string;
    name: string;
    interval?: number;
    interval_range_start?: number;
    interval_range_end?: number;
    created_at: string;
    status: Status;

    post_id: string;
    type_of: ReactionType;

    author_id?: number;
    author?: User;

    users?: User[];
    reactions?: Reaction[];
}

export interface Reaction {
    id?: number;
    type_of: ReactionType;
    status: Status;
    message?: string;
    post_id: string;
    created_at: string;
    published_at?: string;
    user_id?: number;
    user?: User;
    process_id?: number;
    process?: ReactionProcess;
    scheduled_for?: string;
}

export interface Proxy{
    id : number,
    hostname : string,
    port : number,
    password: string,
    active : boolean
}