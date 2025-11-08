import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDirectChat } from "@/services/chat";
import { useSearchUsers } from "@/services/user";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner-utils";
import { useAuth } from "@/hooks/useAuth";
import type { UserDto } from "@/types/chat";

interface CreateChatModalProps {
  onClose: () => void;
}

export const CreateChatModal = ({ onClose }: CreateChatModalProps) => {
  const navigate = useNavigate();
  const createDirectChat = useCreateDirectChat();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(
    searchQuery,
    searchQuery.trim().length >= 2
  );

  const filteredSearchResults = useMemo(() => {
    if (!user?.id) return searchResults;
    return searchResults.filter((result) => result.id !== user.id);
  }, [searchResults, user?.id]);

  const handleUserSelect = (user: UserDto) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
  };

  const handleCreateDirectChat = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    try {
      const chat = await createDirectChat.mutateAsync({
        targetUserId: selectedUser.id,
      });
      navigate(`/chat/${chat.id}`);
      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Failed to create chat");
    }
  };

  const hasSearchResults = searchQuery.trim().length >= 2;

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search by Username</Label>
        <div className="relative">
          <Input
            id="search"
            placeholder="Type username to search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedUser(null);
            }}
          />
          {hasSearchResults && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  Searching...
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="py-1">
                  {filteredSearchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedUser?.id === user.id ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="font-medium">{user.username}</div>
                      {user.username && (
                        <div className="text-sm text-gray-500">
                          {user.username}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {hasSearchResults && <div className="h-60"></div>}
        {selectedUser && (
          <p className="text-xs text-gray-500">
            Selected: {selectedUser.username}
          </p>
        )}
      </div>
      <Button
        onClick={handleCreateDirectChat}
        disabled={createDirectChat.isPending || !selectedUser}
        className="w-full"
      >
        {createDirectChat.isPending ? "Creating..." : "Create Chat"}
      </Button>
    </div>
  );
};
