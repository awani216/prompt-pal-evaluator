
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LLMConfiguration = () => {
  const [configs, setConfigs] = useState({
    groq: {
      enabled: false,
      apiKey: "",
      model: "llama3-8b-8192",
      showKey: false,
      connected: false
    },
    gemini: {
      enabled: false,
      apiKey: "",
      model: "gemini-pro",
      showKey: false,
      connected: false
    },
    judge: {
      provider: "groq",
      model: "llama3-8b-8192",
      enabled: true
    }
  });
  const { toast } = useToast();

  const testConnection = async (provider: string) => {
    const config = configs[provider as keyof typeof configs];
    if (!config.apiKey) {
      toast({
        title: "API Key Required",
        description: `Please enter your ${provider.toUpperCase()} API key first`,
        variant: "destructive",
      });
      return;
    }

    // Simulate API test - in real implementation, make actual API call
    setTimeout(() => {
      setConfigs(prev => ({
        ...prev,
        [provider]: { ...prev[provider as keyof typeof prev], connected: true }
      }));
      toast({
        title: "Connection successful",
        description: `${provider.toUpperCase()} API is working correctly`,
      });
    }, 1000);
  };

  const updateConfig = (provider: string, field: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: { ...prev[provider as keyof typeof prev], [field]: value }
    }));
  };

  const toggleKeyVisibility = (provider: string) => {
    updateConfig(provider, 'showKey', !configs[provider as keyof typeof configs].showKey);
  };

  const providerCards = [
    {
      key: 'groq',
      name: 'Groq',
      description: 'Ultra-fast inference with open-source models',
      color: 'orange',
      models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768']
    },
    {
      key: 'gemini',
      name: 'Google Gemini',
      description: 'Advanced AI model from Google',
      color: 'blue',
      models: ['gemini-pro', 'gemini-pro-vision']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">LLM Provider Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure your API keys and models for parallel evaluation
        </p>
      </div>

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          API keys are stored locally in your browser and never sent to our servers. 
          For production use, consider using environment variables.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {providerCards.map((provider) => {
          const config = configs[provider.key as keyof typeof configs];
          return (
            <Card key={provider.key} className={`border-l-4 ${
              provider.color === 'orange' ? 'border-l-orange-500' : 'border-l-blue-500'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {provider.name}
                      {config.connected && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => updateConfig(provider.key, 'enabled', enabled)}
                  />
                </div>
              </CardHeader>
              
              {config.enabled && (
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`${provider.key}-key`}>API Key</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="relative flex-1">
                        <Input
                          id={`${provider.key}-key`}
                          type={config.showKey ? "text" : "password"}
                          value={config.apiKey}
                          onChange={(e) => updateConfig(provider.key, 'apiKey', e.target.value)}
                          placeholder={`Enter your ${provider.name} API key`}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleKeyVisibility(provider.key)}
                        >
                          {config.showKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => testConnection(provider.key)}
                        disabled={!config.apiKey}
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`${provider.key}-model`}>Model</Label>
                    <select
                      id={`${provider.key}-model`}
                      value={config.model}
                      onChange={(e) => updateConfig(provider.key, 'model', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md bg-white"
                    >
                      {provider.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Judge Configuration */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Automated Judge Configuration
            </CardTitle>
            <CardDescription>
              Configure the LLM that will evaluate responses for correctness and faithfulness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="judge-provider">Judge Provider</Label>
              <select
                id="judge-provider"
                value={configs.judge.provider}
                onChange={(e) => updateConfig('judge', 'provider', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                <option value="groq">Groq</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div>
              <Label htmlFor="judge-model">Judge Model</Label>
              <select
                id="judge-model"
                value={configs.judge.model}
                onChange={(e) => updateConfig('judge', 'model', e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-white"
              >
                {configs.judge.provider === 'groq' ? (
                  <>
                    <option value="llama3-8b-8192">Llama 3 8B</option>
                    <option value="llama3-70b-8192">Llama 3 70B</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                  </>
                ) : (
                  <>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </>
                )}
              </select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The judge will evaluate each response on a 1-10 scale for both correctness and faithfulness.
                Make sure your selected judge provider is properly configured above.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={!configs.groq.enabled && !configs.gemini.enabled}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default LLMConfiguration;
