
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Edit3, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PromptManager = ({ dataset, prompts, onPromptsChange }) => {
  const [newPrompt, setNewPrompt] = useState({ name: "", template: "" });
  const [editingIndex, setEditingIndex] = useState(-1);
  const { toast } = useToast();

  const availableVariables = dataset?.headers || [];

  const extractVariables = (template) => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const validatePrompt = (template) => {
    const variables = extractVariables(template);
    const invalidVariables = variables.filter(
      variable => !availableVariables.includes(variable)
    );
    return { isValid: invalidVariables.length === 0, invalidVariables };
  };

  const handleAddPrompt = () => {
    if (!newPrompt.name || !newPrompt.template) {
      toast({
        title: "Missing fields",
        description: "Please provide both name and template",
        variant: "destructive",
      });
      return;
    }

    const { isValid, invalidVariables } = validatePrompt(newPrompt.template);
    if (!isValid) {
      toast({
        title: "Invalid variables",
        description: `These variables are not in your dataset: ${invalidVariables.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const updatedPrompts = [...prompts, { ...newPrompt, id: Date.now() }];
    onPromptsChange?.(updatedPrompts);
    setNewPrompt({ name: "", template: "" });
    
    toast({
      title: "Prompt added",
      description: `"${newPrompt.name}" has been added to your prompts`,
    });
  };

  const handleEditPrompt = (index) => {
    setEditingIndex(index);
    setNewPrompt(prompts[index]);
  };

  const handleUpdatePrompt = () => {
    if (!newPrompt.name || !newPrompt.template) {
      toast({
        title: "Missing fields",
        description: "Please provide both name and template",
        variant: "destructive",
      });
      return;
    }

    const { isValid, invalidVariables } = validatePrompt(newPrompt.template);
    if (!isValid) {
      toast({
        title: "Invalid variables",
        description: `These variables are not in your dataset: ${invalidVariables.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const updatedPrompts = [...prompts];
    updatedPrompts[editingIndex] = newPrompt;
    onPromptsChange?.(updatedPrompts);
    setEditingIndex(-1);
    setNewPrompt({ name: "", template: "" });
    
    toast({
      title: "Prompt updated",
      description: `"${newPrompt.name}" has been updated`,
    });
  };

  const handleDeletePrompt = (index) => {
    const updatedPrompts = prompts.filter((_, i) => i !== index);
    onPromptsChange?.(updatedPrompts);
    
    toast({
      title: "Prompt deleted",
      description: "The prompt has been removed",
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setNewPrompt({ name: "", template: "" });
  };

  const renderPromptPreview = (template) => {
    if (!dataset?.rows?.[0]) return template;
    
    const firstRow = dataset.rows[0];
    return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return firstRow[variable] || match;
    });
  };

  return (
    <div className="space-y-6">
      {!dataset && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please upload a dataset first to create prompts with template variables.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex >= 0 ? "Edit Prompt" : "Create New Prompt"}
          </CardTitle>
          <CardDescription>
            Use template variables like {`{{column_name}}`} to reference dataset columns.
            {availableVariables.length > 0 && (
              <span> Available variables: {availableVariables.map(variable => `{{${variable}}}`).join(", ")}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt-name">Prompt Name</Label>
            <Input
              id="prompt-name"
              value={newPrompt.name}
              onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
              placeholder="Enter a descriptive name for your prompt"
            />
          </div>

          <div>
            <Label htmlFor="prompt-template">Prompt Template</Label>
            <Textarea
              id="prompt-template"
              value={newPrompt.template}
              onChange={(e) => setNewPrompt({ ...newPrompt, template: e.target.value })}
              placeholder="Enter your prompt template with variables like {{variable_name}}"
              rows={4}
            />
          </div>

          {newPrompt.template && dataset?.rows?.[0] && (
            <div>
              <Label>Preview (using first row)</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {renderPromptPreview(newPrompt.template)}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {editingIndex >= 0 ? (
              <>
                <Button onClick={handleUpdatePrompt}>Update Prompt</Button>
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              </>
            ) : (
              <Button onClick={handleAddPrompt} disabled={!dataset}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {prompts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Saved Prompts</h3>
          <div className="grid gap-4">
            {prompts.map((prompt, index) => (
              <Card key={prompt.id || index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{prompt.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrompt(index)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePrompt(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Template:</Label>
                      <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                        {prompt.template}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {extractVariables(prompt.template).map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>

                    {dataset?.rows?.[0] && (
                      <div>
                        <Label className="text-sm font-medium">Preview:</Label>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          {renderPromptPreview(prompt.template)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManager;
