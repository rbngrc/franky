import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import type { Proveedor } from '../types/proveedor.types';

interface DeclaracionDDLProps {
  proveedor: Proveedor;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export const DeclaracionDDL: React.FC<DeclaracionDDLProps> = ({ proveedor }) => {
  const handleDownloadPDF = async () => {
    const qrData = JSON.stringify({
      tipo: 'DeclaracionProveedor',
      id: proveedor.id,
      nombre: proveedor.nombre,
      documento: `${proveedor.tipoDocumento} ${proveedor.numeroDocumento}`,
      paisOrigen: proveedor.paisOrigen,
    });

    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, qrData, { width: 120, margin: 1 });
    await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

    const year = new Date().getFullYear();
    const ddlCode = `DDL-PROV-${year}-${proveedor.id}`;
    const now = new Date().toLocaleString('es-ES');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 15;
    let y = margin;

    const writeSection = (title: string) => {
      if (y > 270) { pdf.addPage(); y = margin; }
      pdf.setDrawColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(title, margin, y);
      y += 3;
      pdf.line(margin, y, 195, y);
      y += 5;
    };

    const writeDataRow = (label: string, value: string) => {
      if (y > 275) { pdf.addPage(); y = margin; }
      pdf.setFontSize(9);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(label, margin + 3, y);
      const labelW = pdf.getTextWidth(label + '  ');
      pdf.setFont('Helvetica', 'normal');
      pdf.text(value, margin + 3 + labelW, y);
      y += 5;
    };

    // Title
    pdf.setFontSize(16);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('DECLARACIÓN DE DILIGENCIA DEBIDA (EUDR)', margin, y);
    y += 7;
    pdf.setFontSize(13);
    pdf.text('FICHA DE PROVEEDOR / LÍNEA DE VIDA', margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Código DDL: ${ddlCode}`, margin, y);
    y += 4;
    pdf.text(`Emitido: ${now}`, margin, y);
    y += 8;

    // A. IDENTIFICACIÓN
    writeSection('A. IDENTIFICACIÓN DEL PROVEEDOR');
    writeDataRow('Nombre:', proveedor.nombre);
    writeDataRow('Documento:', `${proveedor.tipoDocumento} ${proveedor.numeroDocumento}`);
    writeDataRow('Dirección:', proveedor.direccion || '—');
    writeDataRow('Teléfono:', proveedor.telefono || '—');
    writeDataRow('Email:', proveedor.email || '—');

    // B. ORIGEN
    writeSection('B. ORIGEN DE LA MADERA');
    writeDataRow('País de origen:', proveedor.paisOrigen);
    writeDataRow('Región / Estado:', proveedor.regionOrigen || '—');

    // C. DECLARACIÓN
    writeSection('C. DECLARACIÓN DE DILIGENCIA DEBIDA');
    writeDataRow('Estado:', proveedor.activo ? 'Activo' : 'Inactivo');
    writeDataRow('Fecha declaración:', formatDate(new Date()));
    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(
      'El proveedor declarante confirma que la madera suministrada cumple con la',
      margin + 3, y
    );
    y += 4;
    pdf.text(
      'legislación aplicable del país de origen y con los requisitos del Reglamento (UE)',
      margin + 3, y
    );
    y += 4;
    pdf.text(
      '2023/1115 (EUDR).',
      margin + 3, y
    );
    y += 8;

    // QR
    if (y > 240) { pdf.addPage(); y = margin; }
    y += 5;
    const qrImgData = qrCanvas.toDataURL('image/png');
    const qrSize = 35;
    const qrX = (210 - qrSize) / 2;
    pdf.addImage(qrImgData, 'PNG', qrX, y, qrSize, qrSize);
    y += qrSize + 3;
    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Escanee para verificar los datos del proveedor', 210 / 2, y, { align: 'center' });

    pdf.save(`${ddlCode}.pdf`);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={handleDownloadPDF} className="btn btn-primary">
        Descargar DDL (PDF)
      </button>
      <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
        Declaración de Diligencia Debida — Línea de Vida del proveedor
      </span>
    </div>
  );
};
