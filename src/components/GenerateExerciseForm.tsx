import * as React from "../lib/react-compat";
import { useToast } from "./ui/use-toast";
import { useForm } from "../lib/hooks/useForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./ui/form";
import type { LanguageDTO, ProficiencyLevelDTO, CreateTextCommand } from "../types";

// Form values interface
interface GenerateExerciseValues {
  languageId: string;
  proficiencyLevelId: string;
  topic: string;
  visibility: "public" | "private";
}

export default function GenerateExerciseForm() {
  const { toast } = useToast();

  // Load data for form
  const [languages, setLanguages] = React.useState<LanguageDTO[]>([]);
  const [proficiencyLevels, setProficiencyLevels] = React.useState<ProficiencyLevelDTO[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Setup form
  const form = useForm<GenerateExerciseValues>({
    initialValues: {
      languageId: "",
      proficiencyLevelId: "",
      topic: "",
      visibility: "private",
    },
    validate: (values) => {
      const errors: Partial<Record<keyof GenerateExerciseValues, string>> = {};

      if (!values.languageId) {
        errors.languageId = "Please select a language";
      }

      if (!values.proficiencyLevelId) {
        errors.proficiencyLevelId = "Please select a proficiency level";
      }

      if (!values.topic.trim()) {
        errors.topic = "Please enter a topic";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Prepare payload for API
        const payload: CreateTextCommand = {
          language_id: values.languageId,
          proficiency_level_id: values.proficiencyLevelId,
          topic: values.topic.trim(),
          visibility: values.visibility,
        };

        // Make API call
        const response = await fetch("/api/exercises", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to generate exercise");
        }

        const data = await response.json();
        // Redirect to the newly created exercise
        window.location.href = `/exercises/${data.id}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });

        throw error; // Re-throw to be caught by the form handler
      }
    },
  });

  // Fetch languages and proficiency levels on component mount
  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);

      try {
        // Fetch languages
        const languagesResponse = await fetch("/api/languages");
        console.log("Languages response status:", languagesResponse.status);
        console.log("Languages response headers:", languagesResponse.headers);
        
        if (!languagesResponse.ok) {
          const errorText = await languagesResponse.text();
          console.log("Languages error response:", errorText);
          throw new Error("Failed to fetch languages");
        }
        const languagesData = await languagesResponse.json();

        // Fetch proficiency levels
        const levelsResponse = await fetch("/api/proficiency-levels");
        if (!levelsResponse.ok) {
          throw new Error("Failed to fetch proficiency levels");
        }
        const levelsData = await levelsResponse.json();

        // Update state with fetched data
        setLanguages(languagesData);
        setProficiencyLevels(levelsData);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Exercise</CardTitle>
        <CardDescription>Configure the parameters for your custom language exercise</CardDescription>
      </CardHeader>

      <Form onSubmit={form.handleSubmit}>
        <CardContent className="space-y-6">
          {/* Language Select */}
          <FormItem>
            <FormLabel htmlFor="languageId">Target Language</FormLabel>
            <FormControl>
              <Select
                value={form.formState.languageId.value}
                onValueChange={(value: string) => form.handleChange("languageId", value)}
                disabled={form.isSubmitting || isLoading || languages.length === 0}
              >
                <SelectTrigger id="languageId" aria-label="Select target language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {form.formState.languageId.error && <FormMessage>{form.formState.languageId.error}</FormMessage>}
          </FormItem>

          {/* Proficiency Level Select */}
          <FormItem>
            <FormLabel htmlFor="proficiencyLevelId">Proficiency Level</FormLabel>
            <FormControl>
              <Select
                value={form.formState.proficiencyLevelId.value}
                onValueChange={(value: string) => form.handleChange("proficiencyLevelId", value)}
                disabled={form.isSubmitting || isLoading || proficiencyLevels.length === 0}
              >
                <SelectTrigger id="proficiencyLevelId" aria-label="Select proficiency level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {form.formState.proficiencyLevelId.error && (
              <FormMessage>{form.formState.proficiencyLevelId.error}</FormMessage>
            )}
          </FormItem>

          {/* Topic Input */}
          <FormItem>
            <FormLabel htmlFor="topic">Topic or Theme</FormLabel>
            <FormControl>
              <Input
                id="topic"
                type="text"
                placeholder="e.g., Travel, Business, Everyday Conversations"
                value={form.formState.topic.value}
                onChange={(e) => form.handleChange("topic", e.target.value)}
                disabled={form.isSubmitting || isLoading}
                aria-label="Exercise topic"
              />
            </FormControl>
            {form.formState.topic.error && <FormMessage>{form.formState.topic.error}</FormMessage>}
          </FormItem>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel htmlFor="visibility">Make Public</FormLabel>
              <FormDescription>Allow other users to view and interact with this exercise</FormDescription>
            </div>
            <Switch
              id="visibility"
              checked={form.formState.visibility.value === "public"}
              onCheckedChange={(checked: boolean) => form.handleChange("visibility", checked ? "public" : "private")}
              disabled={form.isSubmitting || isLoading}
              aria-label="Toggle exercise visibility"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end items-center">
          <Button
            type="submit"
            disabled={
              form.isSubmitting ||
              isLoading ||
              !form.formState.languageId.value ||
              !form.formState.proficiencyLevelId.value ||
              !form.formState.topic.value.trim()
            }
          >
            {form.isSubmitting ? (
              <>
                <span className="mr-2">⌛</span>
                Generating...
              </>
            ) : (
              "Generate Exercise"
            )}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}
