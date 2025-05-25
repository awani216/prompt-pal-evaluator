
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Target, Edit2, Trash2, Eye, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptManagerProps {
  prompts: any[];
  setPrompts: (prompts: any[]) => void;
  dataset: any;
}

const PromptManager = ({ prompts, setPrompts, dataset }: PromptManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "",
    version: "1.0"
  });
  const { toast } = useToast();

  const extractVariables = (template: string) => {
    const matches = template.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(match => match.replace(/\{\{|\}\}/g, '')) : [];
  };

  const validateTemplate = (template: string) => {
    if (!dataset) return { valid: true, errors: [] };
    
    const variables = extractVariables(template);
    const errors: string[] = [];
    
    variables.forEach(variable => {
      if (!dataset.headers.includes(variable)) {
        errors.push(`Variable "{{${variable}}}" not found in dataset columns`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.template.trim()) {
      toast({
        title: "Validation error",
        description: "Template is required",
        variant: "destructive",
      });
      return;
    }

    const validation = validateTemplate(formData.template);
    if (!validation.valid) {
      toast({
        title: "Template validation failed",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    const promptData = {
      ...formData,
      id: editingPrompt?.id || Date.now().toString(),
      variables: extractVariables(formData.template),
      createdAt: editingPrompt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPrompt) {
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? promptData : p));
      toast({
        title: "Prompt updated",
        description: `"${formData.name}" has been updated successfully`,
      });
    } else {
      setPrompts([...prompts, promptData]);
      toast({
        title: "Prompt created",
        description: `"${formData.name}" has been added to your templates`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", template: "", version: "1.0" });
    setShowForm(false);
    setEditingPrompt(null);
  };

  const handleEdit = (prompt: any) => {
    setFormData(prompt);
    setEditingPrompt(prompt);
    setShowForm(true);
  };

  const handleDelete = (promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
    toast({
      title: "Prompt deleted",
      description: "The prompt template has been removed",
    });
  };

  const generatePreview = (template: string) => {
    if (!dataset || !dataset.rows.length) return template;
    
    const sampleRow = dataset.rows[0];
    let preview = template;
    
    extractVariables(template).forEach(variable => {
      if (sampleRow[variable]) {
        preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), sampleRow[variable]);
      }
    });
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {!dataset && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upload a dataset first to create prompts with template variables.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Prompt Templates</h3>
          <p className="text-sm text-gray-600">
            Create reusable prompts with variables from your dataset
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!dataset}>
          <Plus className="w-4 h-4 mr-2" />
          New Prompt
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {editingPrompt ? "Edit Prompt Template" : "Create Prompt Template"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Question Answering"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the prompt purpose"
                />
              </div>

              <div>
                <Label htmlFor="template">Prompt Template</Label>
                <Textarea
                  id="template"
                  value={formData.template}
                  onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Enter your prompt template using {{variable}} for dataset columns"
                  rows={4}
                  required
                />
                {dataset && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Available variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {dataset.headers.map((header: string) => (
                        <Badge key={header} variant="outline" className="text-xs">
                          {`{{${header}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {formData.template && dataset && (
                <div>
                  <Label>Preview with Sample Data</Label>
                  <div className="mt-1 p-3 bg-gray-100 rounded-md text-sm">
                    {generatePreview(formData.template)}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingPrompt ? "Update Template" : "Create Template"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {prompts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prompt templates yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Create your first prompt template to start evaluating LLMs
              </p>
              <Button onClick={() => setShowForm(true)} disabled={!dataset}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {prompt.name}
                      <Badge variant="secondary">v{prompt.version}</Badge>
                    </CardTitle>
                    {prompt.description && (
                      <CardDescription className="mt-1">
                        {prompt.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">TEMPLATE</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm font-mono">
                      {prompt.template}
                    </div>
                  </div>
                  
                  {prompt.variables.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">VARIABLES</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {prompt.variables.map((variable: string) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptManager;
