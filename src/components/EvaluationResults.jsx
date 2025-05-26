
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Award, Info, Download } from "lucide-react";

const EvaluationResults = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockResults = [
    {
      id: 1,
      prompt: "What is the capital of {{country}}?",
      dataRow: { country: "France", population: "67 million" },
      responses: {
        groq: {
          response: "The capital of France is Paris.",
          correctness: 10,
          faithfulness: 10
        },
        gemini: {
          response: "Paris is the capital city of France.",
          correctness: 10,
          faithfulness: 10
        }
      }
    },
    {
      id: 2,
      prompt: "What is the population of {{country}}?",
      dataRow: { country: "France", population: "67 million" },
      responses: {
        groq: {
          response: "France has approximately 67 million people.",
          correctness: 9,
          faithfulness: 10
        },
        gemini: {
          response: "The population of France is around 68 million.",
          correctness: 8,
          faithfulness: 7
        }
      }
    }
  ];

  const calculateAverageScores = (results) => {
    if (!results.length) return { groq: { correctness: 0, faithfulness: 0 }, gemini: { correctness: 0, faithfulness: 0 } };
    
    const totals = results.reduce((acc, result) => {
      Object.keys(result.responses).forEach(provider => {
        if (!acc[provider]) acc[provider] = { correctness: 0, faithfulness: 0, count: 0 };
        acc[provider].correctness += result.responses[provider].correctness;
        acc[provider].faithfulness += result.responses[provider].faithfulness;
        acc[provider].count += 1;
      });
      return acc;
    }, {});

    Object.keys(totals).forEach(provider => {
      totals[provider].correctness = totals[provider].correctness / totals[provider].count;
      totals[provider].faithfulness = totals[provider].faithfulness / totals[provider].count;
    });

    return totals;
  };

  const averageScores = calculateAverageScores(mockResults);

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {mockResults.length === 0 && !isLoading && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No evaluation results yet. Configure your LLMs and run an evaluation to see results here.
          </AlertDescription>
        </Alert>
      )}

      {mockResults.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockResults.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(mockResults[0]?.responses || {}).length} providers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Correctness</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(averageScores).length > 0 
                    ? (Object.values(averageScores).reduce((sum, scores) => sum + scores.correctness, 0) / Object.values(averageScores).length).toFixed(1)
                    : "0.0"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of 10.0 scale
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Faithfulness</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(averageScores).length > 0 
                    ? (Object.values(averageScores).reduce((sum, scores) => sum + scores.faithfulness, 0) / Object.values(averageScores).length).toFixed(1)
                    : "0.0"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of 10.0 scale
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="detailed" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
                <TabsTrigger value="summary">Provider Summary</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>

            <TabsContent value="detailed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Results</CardTitle>
                  <CardDescription>
                    Detailed view of all evaluations with individual scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prompt</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Correctness</TableHead>
                          <TableHead>Faithfulness</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockResults.map((result) =>
                          Object.entries(result.responses).map(([provider, response]) => (
                            <TableRow key={`${result.id}-${provider}`}>
                              <TableCell className="font-medium max-w-xs">
                                <div className="truncate">{result.prompt}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {Object.entries(result.dataRow).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {value}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{provider}</Badge>
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div className="truncate">{response.response}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getScoreBadgeVariant(response.correctness)}>
                                  {response.correctness}/10
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getScoreBadgeVariant(response.faithfulness)}>
                                  {response.faithfulness}/10
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(averageScores).map(([provider, scores]) => (
                  <Card key={provider}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{provider}</span>
                        <Badge variant="outline">{provider}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Correctness</span>
                          <span className={getScoreColor(scores.correctness)}>
                            {scores.correctness.toFixed(1)}/10
                          </span>
                        </div>
                        <Progress value={scores.correctness * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Faithfulness</span>
                          <span className={getScoreColor(scores.faithfulness)}>
                            {scores.faithfulness.toFixed(1)}/10
                          </span>
                        </div>
                        <Progress value={scores.faithfulness * 10} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Running evaluations...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvaluationResults;
