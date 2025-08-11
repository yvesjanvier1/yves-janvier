import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Code, BookOpen, Calendar, Headphones, Plus, X } from "lucide-react";
import { useNowPage } from "@/hooks/useNowPage";

const nowSchema = z.object({
  workingOn: z.array(z.string().min(1, "Item cannot be empty")),
  currentlyLearning: z.array(z.string().min(1, "Item cannot be empty")),
  usingRightNow: z.array(z.string().min(1, "Item cannot be empty")),
  listeningTo: z.array(z.string().min(1, "Item cannot be empty")),
  lastUpdated: z.string(),
});

type NowFormData = z.infer<typeof nowSchema>;

const NowForm = () => {
  const { toast } = useToast();
  const { data, isLoading: dataLoading, saveNowPageData } = useNowPage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<NowFormData>({
    resolver: zodResolver(nowSchema),
    defaultValues: {
      workingOn: ["🚀 Building an AI-powered portfolio analytics dashboard"],
      currentlyLearning: ["🧠 Advanced TypeScript patterns and utility types"],
      usingRightNow: ["💻 MacBook Pro M2 with dual 4K monitors"],
      listeningTo: ["🎵 Synthwave playlists for deep coding sessions"],
      lastUpdated: new Date().toISOString().split('T')[0],
    }
  });

  // Update form when data is loaded
  useEffect(() => {
    if (data) {
      reset({
        workingOn: data.workingOn,
        currentlyLearning: data.currentlyLearning,
        usingRightNow: data.usingRightNow,
        listeningTo: data.listeningTo,
        lastUpdated: data.lastUpdated,
      });
    }
  }, [data, reset]);

  const watchedFields = watch();

  const addItem = (section: keyof Pick<NowFormData, 'workingOn' | 'currentlyLearning' | 'usingRightNow' | 'listeningTo'>) => {
    const currentItems = watchedFields[section] || [];
    setValue(section, [...currentItems, ""]);
  };

  const removeItem = (section: keyof Pick<NowFormData, 'workingOn' | 'currentlyLearning' | 'usingRightNow' | 'listeningTo'>, index: number) => {
    const currentItems = watchedFields[section] || [];
    setValue(section, currentItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData: NowFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure all required fields are present and properly typed
      const dataToSave = {
        workingOn: formData.workingOn || [],
        currentlyLearning: formData.currentlyLearning || [],
        usingRightNow: formData.usingRightNow || [],
        listeningTo: formData.listeningTo || [],
        lastUpdated: formData.lastUpdated || new Date().toISOString().split('T')[0],
      };

      const success = await saveNowPageData(dataToSave);
      if (success) {
        toast({
          title: "Success!",
          description: "Now page has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update now page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    {
      key: 'workingOn' as const,
      title: "I'm Working On",
      icon: Code,
      gradient: "from-[#6C4DFF] to-[#4A90E2]",
      description: "Current projects, goals, and initiatives"
    },
    {
      key: 'currentlyLearning' as const,
      title: "Currently Learning",
      icon: BookOpen,
      gradient: "from-[#4A90E2] to-[#FF6B6B]",
      description: "Skills, tools, or concepts being explored"
    },
    {
      key: 'usingRightNow' as const,
      title: "Using Right Now",
      icon: Calendar,
      gradient: "from-[#FF6B6B] to-[#6C4DFF]",
      description: "Tools, apps, hardware, and workflows"
    },
    {
      key: 'listeningTo' as const,
      title: "Listening To",
      icon: Headphones,
      gradient: "from-[#6C4DFF] to-[#FF6B6B]",
      description: "Music, podcasts, and audio content"
    }
  ];

  if (dataLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Now Page Management</h1>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Now Page Management</h1>
          <p className="text-muted-foreground mt-2">
            Update what you're currently working on, learning, and enjoying
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Last Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="lastUpdated">Last Updated Date</Label>
            <Input
              id="lastUpdated"
              type="date"
              {...register("lastUpdated")}
              className="max-w-xs"
            />
            {errors.lastUpdated && (
              <p className="text-sm text-destructive">{errors.lastUpdated.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {sections.map((section) => {
        const IconComponent = section.icon;
        const items = watchedFields[section.key] || [];

        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${section.gradient}`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className={`text-xl font-bold bg-gradient-to-r ${section.gradient} text-transparent bg-clip-text`}>
                    {section.title}
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    {section.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      {...register(`${section.key}.${index}` as const)}
                      placeholder="Enter item (emojis encouraged! 🚀)"
                      className="min-h-[60px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(section.key, index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addItem(section.key)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                {errors[section.key] && (
                  <p className="text-sm text-destructive">
                    Please fill in all items or remove empty ones
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </form>
  );
};

export default NowForm;
