
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DatasetUpload = ({ onDatasetChange }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    return { headers, rows };
  };

  const handleFileUpload = useCallback(async (event) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(uploadedFile);
    setIsLoading(true);
    setError(null);

    try {
      const text = await uploadedFile.text();
      const { headers, rows } = parseCSV(text);
      
      if (headers.length === 0) {
        throw new Error('No headers found in CSV file');
      }

      if (rows.length === 0) {
        throw new Error('No data rows found in CSV file');
      }

      setHeaders(headers);
      setData(rows);
      onDatasetChange?.({ headers, rows, file: uploadedFile });
      
      toast({
        title: "Dataset uploaded successfully",
        description: `Loaded ${rows.length} rows with ${headers.length} columns`,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onDatasetChange, toast]);

  const handleRemoveFile = () => {
    setFile(null);
    setData([]);
    setHeaders([]);
    setError(null);
    onDatasetChange?.(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="csv-upload">CSV Dataset</Label>
        <div className="flex items-center gap-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="cursor-pointer"
          />
          {file && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRemoveFile}
              disabled={isLoading}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>Processing your CSV file...</AlertDescription>
        </Alert>
      )}

      {file && !isLoading && !error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>
                <strong>{file.name}</strong> - {data.length} rows, {headers.length} columns
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {data.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Preview</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index} className="font-semibold">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    {headers.map((header, cellIndex) => (
                      <TableCell key={cellIndex} className="max-w-xs truncate">
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.length > 5 && (
            <p className="text-sm text-gray-600 text-center">
              Showing first 5 rows of {data.length} total rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DatasetUpload;
