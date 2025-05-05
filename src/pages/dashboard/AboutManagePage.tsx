
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { AboutForm } from "@/components/dashboard/about/AboutForm";
import { SkillForm } from "@/components/dashboard/about/SkillForm";
import { ExperienceForm } from "@/components/dashboard/about/ExperienceForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AboutData {
  id?: string;
  bio: string;
  profile_image: string | null;
  resume_url: string | null;
}

interface Skill {
  id: string;
  category: string;
  items: string[];
}

interface Experience {
  id: string;
  year_range: string;
  role: string;
  company: string;
  description: string;
}

const AboutManagePage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);

  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<{type: 'skill' | 'experience', id: string} | null>(null);

  // Fetch all about page data
  const fetchAboutData = async () => {
    setIsLoading(true);
    try {
      // Fetch about page general data
      const { data: aboutResult, error: aboutError } = await supabase
        .from("about_page")
        .select("*")
        .maybeSingle();

      if (aboutError) throw aboutError;
      
      // Fetch skills
      const { data: skillsResult, error: skillsError } = await supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: true });

      if (skillsError) throw skillsError;

      // Fetch experience
      const { data: experienceResult, error: experienceError } = await supabase
        .from("experience")
        .select("*")
        .order("year_range", { ascending: false });

      if (experienceError) throw experienceError;

      setAboutData(aboutResult);
      setSkills(skillsResult || []);
      setExperiences(experienceResult || []);
    } catch (error) {
      console.error("Error fetching about page data:", error);
      toast.error("Failed to load about page data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // Handle about page general data update
  const handleAboutUpdate = async (data: AboutData) => {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (aboutData?.id) {
        // Update existing record
        const { error } = await supabase
          .from("about_page")
          .update(updateData)
          .eq("id", aboutData.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("about_page")
          .insert([updateData]);

        if (error) throw error;
      }

      toast.success("About page data updated successfully");
      fetchAboutData();
    } catch (error: any) {
      toast.error(`Failed to update about page data: ${error.message}`);
      throw error;
    }
  };

  // Handle skill operations
  const handleSkillSubmit = async (data: any) => {
    try {
      const skillData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (data.id) {
        // Update existing skill
        result = await supabase
          .from("skills")
          .update(skillData)
          .eq("id", data.id);
      } else {
        // Create new skill
        result = await supabase
          .from("skills")
          .insert([skillData]);
      }

      if (result.error) throw result.error;
      
      toast.success(`Skill ${data.id ? "updated" : "created"} successfully`);
      fetchAboutData();
      setEditingSkill(null);
      setShowSkillForm(false);
    } catch (error: any) {
      toast.error(`Failed to ${data.id ? "update" : "create"} skill: ${error.message}`);
      throw error;
    }
  };

  // Handle experience operations
  const handleExperienceSubmit = async (data: any) => {
    try {
      const experienceData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (data.id) {
        // Update existing experience
        result = await supabase
          .from("experience")
          .update(experienceData)
          .eq("id", data.id);
      } else {
        // Create new experience
        result = await supabase
          .from("experience")
          .insert([experienceData]);
      }

      if (result.error) throw result.error;
      
      toast.success(`Experience ${data.id ? "updated" : "created"} successfully`);
      fetchAboutData();
      setEditingExperience(null);
      setShowExperienceForm(false);
    } catch (error: any) {
      toast.error(`Failed to ${data.id ? "update" : "create"} experience: ${error.message}`);
      throw error;
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      let error;

      if (itemToDelete.type === "skill") {
        const result = await supabase
          .from("skills")
          .delete()
          .eq("id", itemToDelete.id);

        error = result.error;
      } else {
        const result = await supabase
          .from("experience")
          .delete()
          .eq("id", itemToDelete.id);

        error = result.error;
      }

      if (error) throw error;

      toast.success(`${itemToDelete.type === "skill" ? "Skill" : "Experience"} deleted successfully`);
      fetchAboutData();
    } catch (error: any) {
      toast.error(`Failed to delete ${itemToDelete.type}: ${error.message}`);
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelSkillForm = () => {
    setEditingSkill(null);
    setShowSkillForm(false);
  };

  const cancelExperienceForm = () => {
    setEditingExperience(null);
    setShowExperienceForm(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage About Page</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AboutForm 
                initialData={aboutData}
                isLoading={isLoading}
                onSubmit={handleAboutUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <div className="space-y-6">
            {showSkillForm ? (
              <SkillForm 
                skill={editingSkill}
                isLoading={false}
                onSubmit={handleSkillSubmit}
                onCancel={cancelSkillForm}
              />
            ) : (
              <Button 
                onClick={() => {
                  setEditingSkill(null);
                  setShowSkillForm(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Skill Category
              </Button>
            )}
            
            {!showSkillForm && skills.map(skill => (
              <Card key={skill.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 flex flex-row justify-between items-center pt-4 pb-4">
                  <CardTitle className="text-xl">{skill.category}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingSkill(skill);
                        setShowSkillForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete({ type: "skill", id: skill.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item, index) => (
                      <div 
                        key={index} 
                        className="bg-muted rounded-full px-3 py-1 text-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="experience">
          <div className="space-y-6">
            {showExperienceForm ? (
              <ExperienceForm 
                experience={editingExperience}
                isLoading={false}
                onSubmit={handleExperienceSubmit}
                onCancel={cancelExperienceForm}
              />
            ) : (
              <Button 
                onClick={() => {
                  setEditingExperience(null);
                  setShowExperienceForm(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            )}
            
            {!showExperienceForm && experiences.map(experience => (
              <Card key={experience.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 flex flex-row justify-between items-center pt-4 pb-4">
                  <div>
                    <CardTitle className="text-xl">{experience.role}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {experience.company} • {experience.year_range}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingExperience(experience);
                        setShowExperienceForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete({ type: "experience", id: experience.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground">{experience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <ConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
        title={`Delete ${itemToDelete?.type === "skill" ? "Skill" : "Experience"}`}
        description={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteItem}
        destructive
      />
    </div>
  );
};

export default AboutManagePage;
