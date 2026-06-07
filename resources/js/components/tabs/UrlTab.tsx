import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';

interface UrlContentSettings {
    content_tab_url_description?: string;
    content_tab_url_placeholder?: string;
    content_button_compare?: string;
}

interface UrlTabProps {
    url: string;
    onUrlChange: (value: string) => void;
    onSubmit: FormEventHandler;
    content?: UrlContentSettings;
}

export default function UrlTab({ url, onUrlChange, onSubmit, content }: UrlTabProps) {
    const c = content ?? {};

    const description = c.content_tab_url_description || 'Fill me from admin/settings page';
    const placeholder = c.content_tab_url_placeholder || 'Fill me from admin/settings page';
    const buttonText = c.content_button_compare || 'Fill me from admin/settings page';

    return (
        <div className="flex w-full flex-col gap-4">
            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                {description}
            </p>
            <form onSubmit={onSubmit} className="flex w-full gap-3">
                <Input
                    type="url"
                    placeholder={placeholder}
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    className="h-14 flex-1 text-lg"
                />
                <Button type="submit" className="h-14 px-8 text-lg">
                    {buttonText}
                </Button>
            </form>
        </div>
    );
}
