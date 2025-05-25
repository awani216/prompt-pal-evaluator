
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Play, Download, Eye, TrendingUp, AlertCircle } from "lucide-react";

interface EvaluationResultsProps {
  dataset: any;
  prompts: any[];
}

const EvaluationResults = ({ dataset, prompts }: EvaluationResultsProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  // Mock evaluation data for demonstration
  const mockResults = [
    {
      id: 1,
      prompt: "Analyze the sentiment of: {{text}}",
      inputData: { text: "I love this product!" },
      groqResponse: "Positive sentiment - expresses strong satisfaction",
      geminiResponse: "This text shows positive sentiment with enthusiasm",
      groqScores: { correctness: 9, faithfulness: 8 },
      geminiScores: { correctness: 8, faithfulness: 9 }
    },
    {
      id: 2,
      prompt: "Summarize: {{content}}",
      inputData: { content: "Long article about AI..." },
      groqResponse: "AI technology is advancing rapidly with new applications",
      geminiResponse: "The article discusses recent advances in artificial intelligence",
      groqScores: { correctness: 7, faithfulness: 8 },
      geminiScores: { correctness: 8, faithfulness: 7 }
    }
  ];

  const runEvaluation = async () => {
    if (!dataset || prompts.length === 0) {
      return;
    }

    setIsRunning(true);
    setProgress(0);

    // Simulate evaluation progress
    const total = dataset.rows.length * prompts.length;
    let completed = 0;

    const interval = setInterval(() => {
      completed += 1;
      setProgress((completed / total) * 100);

      if (completed >= total) {
        clearInterval(interval);
        setResults(mockResults);
        setIsRunning(false);
      }
    }, 100);
  };

  const calculateAverageScores = () => {
    if (results.length === 0) return null;

    const groqCorrectness = results.reduce((sum, r) => sum + r.groqScores.correctness, 0) / results.length;
    const groqFaithfulness = results.reduce((sum, r) => sum + r.groqScores.faithfulness, 0) / results.length;
    const geminiCorrectness = results.reduce((sum, r) => sum + r.geminiScores.correctness, 0) / results.length;
    const geminiFaithfulness = results.reduce((sum, r) => sum + r.geminiScores.faithfulness, 0) / results.length;

    return {
      groq: { correctness: groqCorrectness, faithfulness: groqFaithfulness },
      gemini: { correctness: geminiCorrectness, faithfulness: geminiFaithfulness }
    };
  };

  const averageScores = calculateAverageScores();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Evaluation Results</h3>
          <p className="text-sm text-gray-600">
            Run evaluations and analyze LLM performance metrics
          </p>
        </div>
        <Button
          onClick={runEvaluation}
          disabled={!dataset || prompts.length === 0 || isRunning}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? "Running..." : "Start Evaluation"}
        </Button>
      </div>

      {!dataset && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload a dataset to begin evaluations.
          </AlertDescription>
        </Alert>
      )}

      {dataset && prompts.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Create at least one prompt template to run evaluations.
          </AlertDescription>
        </Alert>
      )}

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 animate-pulse" />
              Evaluation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Processing evaluations...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Detailed Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Evaluation Results</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Prompt</TableHead>
                        <TableHead>Input Data</TableHead>
                        <TableHead>Groq Response</TableHead>
                        <TableHead>Groq Scores</TableHead>
                        <TableHead>Gemini Response</TableHead>
                        <TableHead>Gemini Scores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate" title={result.prompt}>
                              {result.prompt}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm">
                              {Object.entries(result.inputData).map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="font-medium">{key}:</span> {value as string}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm truncate" title={result.groqResponse}>
                              {result.groqResponse}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                C: {result.groqScores.correctness}/10
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                F: {result.groqScores.faithfulness}/10
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm truncate" title={result.geminiResponse}>
                              {result.geminiResponse}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                C: {result.geminiScores.correctness}/10
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                F: {result.geminiScores.faithfulness}/10
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {averageScores && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <TrendingUp className="w-5 h-5" />
                      Groq Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Correctness</span>
                        <span>{averageScores.groq.correctness.toFixed(1)}/10</span>
                      </div>
                      <Progress value={averageScores.groq.correctness * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Faithfulness</span>
                        <span>{averageScores.groq.faithfulness.toFixed(1)}/10</span>
                      </div>
                      <Progress value={averageScores.groq.faithfulness * 10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <TrendingUp className="w-5 h-5" />
                      Gemini Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Correctness</span>
                        <span>{averageScores.gemini.correctness.toFixed(1)}/10</span>
                      </div>
                      <Progress value={averageScores.gemini.correctness * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Faithfulness</span>
                        <span>{averageScores.gemini.faithfulness.toFixed(1)}/10</span>
                      </div>
                      <Progress value={averageScores.gemini.faithfulness * 10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EvaluationResults;
