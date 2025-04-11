import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileText, Video, Download, ExternalLink, Users, Brain, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const resources = [
  {
    id: "r1",
    title: "Alzheimer's Association",
    description: "Leading voluntary health organization in Alzheimer's care, support, and research.",
    type: "Organization",
    url: "https://www.alz.org/",
    icon: <Users className="h-4 w-4 mr-2" />,
  },
  {
    id: "r2",
    title: "National Institute on Aging",
    description: "Provides information on Alzheimer's disease and related dementias.",
    type: "Informational",
    url: "https://www.nia.nih.gov/health/alzheimers-and-related-dementias",
    icon: <Brain className="h-4 w-4 mr-2" />,
  },
  {
    id: "r3",
    title: "ALZConnected Online Community",
    description: "Online community for individuals living with Alzheimer's and their caregivers.",
    type: "Community",
    url: "https://www.alzconnected.org/",
    icon: <Users className="h-4 w-4 mr-2" />,
  },
  {
    id: "r4",
    title: "Cognitive Training Guide",
    description: "Guide to cognitive exercises and activities to improve memory and thinking skills.",
    type: "Guide",
    url: "/cognitive-training-guide.pdf",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
  },
  {
    id: "r5",
    title: "Understanding Alzheimer's",
    description: "Informational video explaining the basics of Alzheimer's disease.",
    type: "Video",
    url: "https://www.youtube.com/watch?v=xxxxx",
    icon: <Video className="h-4 w-4 mr-2" />,
  },
  {
    id: "r6",
    title: "Caregiver's Handbook",
    description: "Comprehensive handbook for caregivers of individuals with Alzheimer's.",
    type: "Handbook",
    url: "/caregivers-handbook.pdf",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
  {
    id: "r7",
    title: "Daily Activity Schedule Template",
    description: "Template for creating a structured daily activity schedule for individuals with Alzheimer's.",
    type: "Template",
    url: "/daily-activity-schedule-template.docx",
    icon: <Calendar className="h-4 w-4 mr-2" />,
  },
  {
    id: "r8",
    title: "Medication Reminder Chart",
    description: "Chart for tracking medication schedules and dosages.",
    type: "Chart",
    url: "/medication-reminder-chart.xlsx",
    icon: <Clock className="h-4 w-4 mr-2" />,
  },
];

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || resource.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">
            Find helpful resources, guides, and support for Alzheimer's care.
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Resource Directory</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8 bg-white/70"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Organization">Organizations</TabsTrigger>
                <TabsTrigger value="Informational">Informational</TabsTrigger>
                <TabsTrigger value="Community">Community</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-3">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="bg-white/70 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center">
                        {resource.icon}
                        {resource.title}
                      </h3>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={resource.url} target="_blank" className="flex items-center">
                        Visit <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="Organization" className="space-y-3">
                {filteredResources
                  .filter((resource) => resource.type === "Organization")
                  .map((resource) => (
                    <div key={resource.id} className="bg-white/70 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          {resource.icon}
                          {resource.title}
                        </h3>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={resource.url} target="_blank" className="flex items-center">
                          Visit <ExternalLink className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  ))}
              </TabsContent>
              <TabsContent value="Informational" className="space-y-3">
                {filteredResources
                  .filter((resource) => resource.type === "Informational")
                  .map((resource) => (
                    <div key={resource.id} className="bg-white/70 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          {resource.icon}
                          {resource.title}
                        </h3>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={resource.url} target="_blank" className="flex items-center">
                          Visit <ExternalLink className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  ))}
              </TabsContent>
              <TabsContent value="Community" className="space-y-3">
                {filteredResources
                  .filter((resource) => resource.type === "Community")
                  .map((resource) => (
                    <div key={resource.id} className="bg-white/70 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          {resource.icon}
                          {resource.title}
                        </h3>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={resource.url} target="_blank" className="flex items-center">
                          Visit <ExternalLink className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
