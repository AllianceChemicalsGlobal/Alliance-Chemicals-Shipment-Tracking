'use client';

import { useEffect, useState } from 'react';
import { supabase, ShipmentDocument } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Download } from 'lucide-react';

const BUCKET = 'shipment-documents';

type Props = {
  shipmentId: string;
};

export function ShipmentDocuments({ shipmentId }: Props) {
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('uploaded_at', { ascending: false });
    if (data) setDocuments(data as ShipmentDocument[]);
  };

  useEffect(() => {
    loadDocuments();
  }, [shipmentId]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const path = `${shipmentId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('documents').insert([
        {
          shipment_id: shipmentId,
          category: 'other',
          title: file.name,
          storage_path: path,
          mime_type: file.type,
          size_bytes: file.size,
          uploaded_by: userData.user.id,
        },
      ]);
      if (insertError) throw insertError;

      await loadDocuments();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (doc: ShipmentDocument) => {
    const { data, error } = await supabase.storage.from(BUCKET).download(doc.storage_path);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.title;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Documents
        </CardTitle>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <Upload className="h-3 w-3" />
          <span>{uploading ? 'Uploading…' : 'Upload'}</span>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </CardHeader>
      <CardContent className="pt-0">
        {documents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">No documents attached.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell className="text-xs uppercase text-muted-foreground">
                      {doc.category}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.size_bytes
                        ? `${(doc.size_bytes / 1024).toFixed(1)} KB`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

