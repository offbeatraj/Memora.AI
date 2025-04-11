
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, Upload, Book, LayoutDashboard } from "lucide-react";
import ThreeScene from "@/components/ThreeScene";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const QuickActions = () => {
  const actions = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Chat Assistant",
      description: "Ask questions about Alzheimer's or get personalized assistance",
      link: "/chat",
      color: "bg-gradient-to-br from-blue-100 to-purple-100",
    },
    {
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: "Patient Dashboard",
      description: "Track cognitive health, activities, and access your memory support tools",
      link: "/dashboard",
      color: "bg-gradient-to-br from-purple-100 to-pink-100",
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Information",
      description: "Add personal information to help personalize your experience",
      link: "/upload",
      color: "bg-gradient-to-br from-green-100 to-teal-100",
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Resources",
      description: "Discover helpful information and resources about Alzheimer's",
      link: "/resources",
      color: "bg-gradient-to-br from-amber-100 to-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      {actions.map((action, i) => (
        <Link to={action.link} key={i} className="group">
          <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 glass-card">
            <CardContent className={`p-6 ${action.color}`}>
              <div className="mb-4 bg-white/80 p-3 rounded-full w-fit">
                {action.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{action.title}</h3>
              <p className="text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="flex flex-col md:flex-row w-full gap-8 items-center justify-between mt-8 md:mt-16">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block animate-float">
              <div className="flex items-center gap-2 mb-4 bg-memora-purple/10 text-memora-purple-dark px-4 py-2 rounded-full">
                <Brain className="h-5 w-5" />
                <span className="font-medium">Alzheimer's Assistant</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              Your Memory Companion
            </h1>
            <p className="text-xl text-foreground/80 mb-8 max-w-xl">
              Memora is a personalized assistant designed to help Alzheimer's patients
              and their caregivers navigate daily challenges with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-memora-purple hover:bg-memora-purple-dark text-white"
                asChild
              >
                <Link to="/chat">Start Conversation</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-memora-purple text-memora-purple hover:bg-memora-purple/10"
                asChild
              >
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 h-[400px] w-full max-w-md">
            {mounted && <ThreeScene />}
          </div>
        </div>

        <QuickActions />

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gradient">How Memora Helps</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-12">
            Our app uses advanced AI to create a personalized experience for each user,
            adapting to individual needs and preferences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Memory Support</h3>
                <p>
                  Memora helps recall important information, events, and memories through
                  personalized conversations and reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Knowledge Base</h3>
                <p>
                  Access reliable information about Alzheimer's disease, treatments,
                  and coping strategies at any time.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Personal Assistant</h3>
                <p>
                  Get help with daily tasks, reminders, and answering questions in a 
                  friendly, conversational manner.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Caregiver Support</h3>
                <p>
                  Tools and resources specifically designed to help caregivers provide
                  better support for their loved ones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
