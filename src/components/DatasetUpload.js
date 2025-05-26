
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
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
            className={`relative border-2 border-dashed rounded-lg p-16 text-center transition-colors min-h-[400px] flex flex-col items-center justify-center ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Upload CSV Dataset</h3>
                <p className="text-gray-600 mt-2 text-lg">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Label htmlFor="file-upload">
                  <Button variant="outline" size="lg" disabled={loading} asChild>
                    <span className="cursor-pointer px-8 py-3">
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
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{dataset.fileName}</h3>
                <p className="text-sm text-gray-600">
                  {dataset.rowCount} rows • {dataset.headers.length} columns
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Validated
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={clearDataset}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
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
              <div className="p-3 bg-gray-50 text-sm text-gray-600 text-center">
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
