
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Brain, Target, BarChart3 } from "lucide-react";
import DatasetUpload from "@/components/DatasetUpload";
import PromptManager from "@/components/PromptManager";
import LLMConfiguration from "@/components/LLMConfiguration";
import EvaluationResults from "@/components/EvaluationResults";

const Index = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [dataset, setDataset] = useState(null);
  const [prompts, setPrompts] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LLM Evaluation Platform</h1>
                <p className="text-sm text-gray-600">Systematic evaluation across multiple models</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Dataset Upload
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Prompt Manager
            </TabsTrigger>
            <TabsTrigger value="llm-config" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              LLM Configuration
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Evaluation Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                  Dataset Upload
                </CardTitle>
                <CardDescription>
                  Upload your CSV dataset for evaluation. The data will be used to generate prompts and run evaluations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetUpload onDatasetChange={setDataset} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Prompt Management
                </CardTitle>
                <CardDescription>
                  Create and manage evaluation prompts with template variables that map to your dataset columns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptManager 
                  dataset={dataset} 
                  prompts={prompts}
                  onPromptsChange={setPrompts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="llm-config" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                  LLM Configuration
                </CardTitle>
                <CardDescription>
                  Configure your LLM providers and automated judgment settings for parallel evaluation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LLMConfiguration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Evaluation Results
                </CardTitle>
                <CardDescription>
                  View and analyze evaluation results with detailed metrics and comparative analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvaluationResults />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
