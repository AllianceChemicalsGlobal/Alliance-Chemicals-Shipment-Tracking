import * as XLSX from 'xlsx';

function fmtDate(v: string | null | undefined): string {
  if (!v) return '';
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(v);
  }
}

export function exportProcurementShipmentsToExcel(shipments: Record<string, unknown>[], filename = 'procurement-international-shipments.xlsx') {
  const headers = [
    'Tracking #',
    'Vendor Ref',
    'Vendor / Supplier Name',
    'Import Description',
    'Order Value',
    'Client',
    'Container No',
    "No 40' Container",
    "No 20' Container",
    'Air Cargo',
    'Net Weight',
    'Vessel / Plane',
    'Terminal',
    'PFI Num',
    'PFI Date',
    'BL/AWB',
    'OBL Date',
    'Insurance Date',
    'NEPZA Approval Date',
    'Agent/Pickup NEPZA',
    'ETS',
    'ETA',
    'TDO',
    'Loading Date from Port',
    'Date Arrived Free Zone',
    'Refund',
    'FZE-ET',
    'Origin Country',
    'Origin Location',
    'Destination Country',
    'Destination Location',
    'Carrier',
    'Status',
    'Current Location',
    'Description',
    'Created At',
  ];

  const rows = shipments.map((s) => [
    (s.tracking_number as string) ?? '',
    (s.vendor_ref as string) ?? '',
    (s.vendor_supplier_name as string) ?? '',
    (s.import_description as string) ?? '',
    (s.order_value as number) ?? '',
    (s.client as string) ?? '',
    (s.container_no as string) ?? '',
    (s.no_40_container as number) ?? '',
    (s.no_20_container as number) ?? '',
    (s.air_cargo as boolean) ? 'Yes' : '',
    (s.net_weight as string) ?? '',
    (s.vessel_plane_name as string) ?? '',
    (s.terminal as string) ?? '',
    (s.pfi_num as string) ?? '',
    fmtDate(s.pfi_date as string),
    (s.bl_awb as string) ?? '',
    fmtDate(s.obl_date as string),
    fmtDate(s.insurance_date as string),
    fmtDate(s.nepza_approval_date as string),
    (s.agent_pickup_nepza as string) ?? '',
    fmtDate(s.ets as string),
    fmtDate(s.estimated_arrival as string),
    fmtDate(s.tdo as string),
    fmtDate(s.loading_date_from_port as string),
    fmtDate(s.date_arrived_free_zone as string),
    (s.refund as string) ?? '',
    fmtDate(s.fze_et as string),
    (s.origin_country as string) ?? '',
    (s.origin_location as string) ?? '',
    (s.destination_country as string) ?? '',
    (s.destination_location as string) ?? '',
    (s.carrier as string) ?? '',
    (s.status as string) ?? '',
    (s.current_location as string) ?? '',
    (s.description as string) ?? '',
    fmtDate(s.created_at as string),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Procurement');
  XLSX.writeFile(wb, filename);
}

export function exportSupplyChainProcurementToExcel(records: Record<string, unknown>[], filename = 'supply-chain-procurement.xlsx') {
  const headers = [
    'Shipment Ref',
    'PFI NO FROM LOGI',
    'Vendor / Supplier Name',
    'Import Description',
    'Order Value (Form)',
    'Gross Weight / Quantity',
    'Form M Status',
    'Pre-Alert Date',
    'FORM M NUMBER',
    'PAAR Submission Date',
    'PAAR Issued Date',
    'PAAR Reference',
    'Column1',
    'Shipment Status',
    'NAFDAC 2nd Stamping Date',
    'C Number',
    'Created At',
  ];

  const rows = records.map((r) => [
    (r.shipment_ref as string) ?? '',
    (r.pfi_no_from_logi as string) ?? '',
    (r.vendor_supplier_name as string) ?? '',
    (r.import_description as string) ?? '',
    (r.order_value_form as number) ?? '',
    (r.gross_weight_quantity as string) ?? '',
    (r.form_m_status as string) ?? '',
    fmtDate(r.pre_alert_date as string),
    (r.form_m_number as string) ?? '',
    fmtDate(r.paar_submission_date as string),
    fmtDate(r.paar_issued_date as string),
    (r.paar_reference as string) ?? '',
    (r.column1 as string) ?? '',
    (r.shipment_status as string) ?? '',
    fmtDate(r.nafdac_2nd_stamping_date as string),
    (r.c_number as string) ?? '',
    fmtDate(r.created_at as string),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Supply Chain');
  XLSX.writeFile(wb, filename);
}
