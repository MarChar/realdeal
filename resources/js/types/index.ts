import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface InAppNotification {
    id: string;
    title: string;
    body: string;
    icon: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
}

export interface OutgoingNotification {
    id: number;
    user_id: number;
    type: string;
    channel: string;
    subject: string | null;
    body: string | null;
    status: 'pending' | 'sent' | 'failed';
    sent_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface SearchCriteria {
    query?: string | null;
    type?: string | null;
    purpose?: string | null;
    bedrooms_min?: number | null;
    bedrooms_max?: number | null;
    bathrooms_min?: number | null;
    city?: string | null;
    district?: string | null;
    price_min?: number | null;
    price_max?: number | null;
    sqm_min?: number | null;
    sqm_max?: number | null;
    condition?: string | null;
    year_built_min?: number | null;
}

export interface PropertyResult {
    id: number;
    title: string;
    price: number;
    sqm: number;
    bedrooms: number;
    bathrooms: number;
    type: string | null;
    city: string;
    purpose: string;
    url: string;
    image_url: string;
    created_at: string;
}

export interface SearchResultsData {
    criteria: SearchCriteria;
    results: PropertyResult[];
    count: number;
    error?: string;
    applied_filters?: Record<string, unknown>;
    dropped_filters?: string[];
}
