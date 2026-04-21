import { nango } from "./nango";

export async function getCalendarEvents(userId: string) {
    try {
        const response = await nango.proxy({
            method: 'GET',
            endpoint: '/primary/events',
            providerConfigKey: 'google-calendar',
            connectionId: userId,
            params: {
                timeMin: new Date().toISOString(),
                maxResults: '10',
                singleEvents: 'true',
                orderBy: 'startTime'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return { error: "Failed to fetch calendar events" };
    }
}

export async function getRecentEmails(userId: string) {
    try {
        const response = await nango.proxy({
            method: 'GET',
            endpoint: '/messages',
            providerConfigKey: 'google-mail',
            connectionId: userId,
            params: {
                maxResults: '5'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching emails:", error);
        return { error: "Failed to fetch recent emails" };
    }
}
