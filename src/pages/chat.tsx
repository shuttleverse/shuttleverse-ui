import Layout from "@/components/layout/layout";
import { ChatList } from "@/components/chat/ChatList";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CreateChatModal } from "@/components/chat/CreateChatModal";

const ChatListPage = () => {
  const [createChatOpen, setCreateChatOpen] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <Dialog open={createChatOpen} onOpenChange={setCreateChatOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Chat</DialogTitle>
                </DialogHeader>
                <CreateChatModal onClose={() => setCreateChatOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="min-h-[60vh]">
            <ChatList />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatListPage;
