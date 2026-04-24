import { create } from 'zustand';

interface Chat {
    id: string;
    title: string;
    createdAt: string;
}

interface ChatsState {
    chats: Chat[];
    activeChatId: string | null;
    isLoading: boolean;
    setChats: (chats: Chat[]) => void;
    setActiveChatId: (id: string | null) => void;
    addChat: (chat: Chat) => void;
    fetchChats: () => Promise<void>;
}

export const useChatsStore = create<ChatsState>((set) => ({
    chats: [],
    activeChatId: null,
    isLoading: false,
    setChats: (chats) => set({ chats }),
    setActiveChatId: (id) => set({ activeChatId: id }),
    addChat: (chat) => set((state) => ({ 
        chats: [chat, ...state.chats.filter(c => c.id !== chat.id)] 
    })),
    fetchChats: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch('/api/chat/history');
            if (response.ok) {
                const data = await response.json() as Chat[];
                set({ chats: data });
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
