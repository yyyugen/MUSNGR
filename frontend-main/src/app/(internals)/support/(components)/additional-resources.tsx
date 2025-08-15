import Link from "next/link";
import { BookOpen, Video, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const resources = [
  {
    title: "User Guide",
    description: "Comprehensive guide on how to use Musngr",
    icon: BookOpen,
    href: "",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video tutorials for common tasks",
    icon: Video,
    href: "",
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    icon: FileText,
    href: "",
  },
];

export function AdditionalResources() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <resource.icon className="h-5 w-5" />
                {resource.title}
              </CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={resource.href}>
                <Button variant="outline" className="w-full">
                  View Resource
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
