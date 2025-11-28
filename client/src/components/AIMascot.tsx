import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, X, Send, Loader2, Sparkles, 
  Wrench, Search, Lightbulb, ChevronDown
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIMascotProps {
  mascotName?: string;
  onSearchQuery?: (query: string, parsed: any) => void;
}

export default function AIMascot({ mascotName = "Buddy", onSearchQuery }: AIMascotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchGreeting();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchGreeting = async () => {
    try {
      const res = await fetch("/api/ai/greeting");
      const data = await res.json();
      setGreeting(data.greeting);
      setMessages([{ role: "assistant", content: data.greeting }]);
    } catch {
      setGreeting(`Hey there! I'm ${mascotName}, your parts-finding buddy. How can I help?`);
      setMessages([{ role: "assistant", content: `Hey there! I'm ${mascotName}, your parts-finding buddy. How can I help?` }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const parseRes = await fetch("/api/ai/parse-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage })
      });
      const parsed = await parseRes.json();

      if (parsed.partType && onSearchQuery) {
        onSearchQuery(userMessage, parsed);
      }

      const chatRes = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }]
        })
      });
      const chatData = await chatRes.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: chatData.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Oops! I'm having trouble connecting. Try again in a moment!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Find brake pads", query: "I need brake pads" },
    { label: "Oil filter", query: "Looking for an oil filter" },
    { label: "ATV parts", query: "I have an ATV that needs parts" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-4 z-50 w-80 md:w-96 bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden"
            data-testid="ai-mascot-chat"
          >
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-tech font-bold text-sm uppercase">{mascotName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online & ready to help
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsMinimized(true)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-72 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-muted/50 border border-border/50 rounded-bl-sm"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors text-xs"
                      onClick={() => {
                        setInput(action.query);
                      }}
                    >
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {action.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-border/50 bg-background/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask me anything about parts..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                  data-testid="ai-mascot-input"
                />
                <Button 
                  size="icon" 
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                  data-testid="ai-mascot-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <Button
              onClick={() => setIsMinimized(false)}
              className="rounded-full px-4 py-2 bg-card border border-primary/30 text-foreground hover:bg-primary/10"
            >
              <Wrench className="w-4 h-4 mr-2 text-primary" />
              <span className="font-tech text-sm">{mascotName}</span>
              <Badge className="ml-2 bg-primary/20 text-primary text-xs">
                {messages.length - 1} msgs
              </Badge>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-colors ${
          isOpen ? "bg-muted" : "bg-gradient-to-br from-primary to-secondary"
        }`}
        data-testid="ai-mascot-toggle"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
          </div>
        )}
      </motion.button>
    </>
  );
}
