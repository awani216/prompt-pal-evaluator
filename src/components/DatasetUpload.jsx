
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle, AlertCircle, X, CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DatasetUpload = ({ dataset, setDataset }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const { toast } = useToast();

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, rows, rowCount: rows.length };
  };

  const validateDataset = (data) => {
    const validationErrors = [];
    
    if (data.headers.length === 0) {
      validationErrors.push('No columns found in the dataset');
    }
    
    if (data.rows.length === 0) {
      validationErrors.push('No data rows found in the dataset');
    }

    // Check for empty values
    const emptyCount = data.rows.reduce((count, row) => {
      return count + data.headers.filter((header) => !row[header] || row[header].trim() === '').length;
    }, 0);

    if (emptyCount > 0) {
      validationErrors.push(`Found ${emptyCount} empty cell(s) in the dataset`);
    }

    return validationErrors;
  };

  const handleFile = useCallback(async (file) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      const validationErrors = validateDataset(parsedData);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        setDataset({
          ...parsedData,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        });
        toast({
          title: "Dataset uploaded successfully",
          description: `Loaded ${parsedData.rowCount} rows with ${parsedData.headers.length} columns`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV file';
      setErrors([errorMessage]);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [setDataset, toast]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearDataset = () => {
    setDataset(null);
    setErrors([]);
    toast({
      title: "Dataset cleared",
      description: "Upload a new CSV file to continue",
    });
  };

  return (
    <div className="space-y-6">
      {!dataset && (
        <>
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer group min-h-[320px] flex flex-col items-center justify-center ${
              dragActive
                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            } ${loading ? "pointer-events-none opacity-75" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive 
                  ? "bg-blue-100 scale-110" 
                  : "bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200"
              }`}>
                <CloudUpload className={`w-12 h-12 transition-all duration-300 ${
                  dragActive ? "text-blue-600" : "text-blue-500 group-hover:text-blue-600"
                }`} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {loading ? "Processing..." : "Upload CSV Dataset"}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {dragActive 
                    ? "Drop your CSV file here" 
                    : "Drag and drop your CSV file here, or click to browse"
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV files up to 10MB
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Label htmlFor="file-upload">
                  <Button 
                    variant="default" 
                    size="lg"
                    disabled={loading} 
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg"
                  >
                    <span className="cursor-pointer flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      {loading ? "Processing..." : "Choose File"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="text-gray-400 text-sm hidden sm:block">or</span>
                <span className="text-sm text-gray-500 font-medium">drag & drop</span>
              </div>
            </div>

            {/* Animated background pattern */}
            <div className={`absolute inset-0 opacity-5 transition-opacity duration-300 ${
              dragActive ? "opacity-10" : ""
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-400 rounded-xl"></div>
            </div>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {dataset && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{dataset.fileName}</h3>
                <p className="text-sm text-gray-600">
                  {dataset.rowCount} rows • {dataset.headers.length} columns
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Validated
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={clearDataset} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {dataset.headers.map((header) => (
                      <TableHead key={header} className="font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.rows.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {dataset.headers.map((header) => (
                        <TableCell key={header} className="max-w-xs truncate">
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {dataset.rowCount > 10 && (
              <div className="p-3 bg-gray-50 text-sm text-gray-600 text-center border-t">
                Showing first 10 rows of {dataset.rowCount} total rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetUpload;
