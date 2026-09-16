"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LessonTabsProps {
  content: React.ReactNode;
  resources: React.ReactNode;
  announcements?: React.ReactNode;
}

export function LessonTabs({ content, resources, announcements }: LessonTabsProps) {
  return (
    <Tabs defaultValue="contenido">
      <TabsList>
        <TabsTrigger value="contenido">Contenido</TabsTrigger>
        <TabsTrigger value="recursos">Recursos</TabsTrigger>
        {announcements ? <TabsTrigger value="anuncios">Anuncios</TabsTrigger> : null}
      </TabsList>
      <TabsContent value="contenido">{content}</TabsContent>
      <TabsContent value="recursos">{resources}</TabsContent>
      {announcements ? <TabsContent value="anuncios">{announcements}</TabsContent> : null}
    </Tabs>
  );
}
