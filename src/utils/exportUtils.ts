
import { Contact } from '@/types/contact';

/**
 * Formats contact data for export
 */
export function formatContactsForExport(contacts: Contact[]): Record<string, string>[] {
  return contacts.map(contact => {
    // Get primary email and phone if available
    const primaryEmail = contact.emails?.find(e => e.is_primary)?.email || contact.email || '';
    const primaryPhone = contact.phones?.find(p => p.is_primary)?.phone || contact.phone || '';
    const primaryAddress = contact.addresses?.find(a => a.is_primary);
    
    // Format address
    const formattedAddress = primaryAddress ? 
      `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zip}, ${primaryAddress.country}` :
      (contact.address ? 
        `${contact.address}, ${contact.city || ''} ${contact.state || ''} ${contact.zip || ''}, ${contact.country || ''}` : 
        '');
    
    // Determine contact type and name
    const contactType = contact.company_name ? 'Company' : 'Person';
    const contactName = contact.company_name || 
      `${contact.prefix || ''} ${contact.first_name || ''} ${contact.middle_name || ''} ${contact.last_name || ''}`.trim();
    
    return {
      'Name': contactName,
      'Type': contactType,
      'Email': primaryEmail,
      'Phone': primaryPhone,
      'Address': formattedAddress,
      'Notes': contact.notes || '',
      'Client': contact.is_client ? 'Yes' : 'No'
    };
  });
}

/**
 * Exports contacts to CSV format
 */
export function exportContactsToCSV(contacts: Contact[]): void {
  const formattedData = formatContactsForExport(contacts);
  if (formattedData.length === 0) return;
  
  const headers = Object.keys(formattedData[0]);
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...formattedData.map(row => 
      headers.map(header => {
        // Handle special characters and ensure proper CSV formatting
        const cellValue = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or newline
        const escapedValue = cellValue.replace(/"/g, '""');
        return /[,\n"]/.test(cellValue) ? `"${escapedValue}"` : escapedValue;
      }).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `contacts_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports contacts to PDF format using browser print capabilities
 */
export function exportContactsToPDF(contacts: Contact[]): void {
  const formattedData = formatContactsForExport(contacts);
  if (formattedData.length === 0) return;
  
  // Create a printable HTML document
  const headers = Object.keys(formattedData[0]);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to export as PDF');
    return;
  }
  
  // Write the HTML content
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contacts Export - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #334155; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f1f5f9; text-align: left; padding: 10px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
        @media print {
          body { margin: 0.5cm; }
          h1 { font-size: 14pt; }
          table, th, td { font-size: 9pt; }
          .footer { font-size: 8pt; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Contacts Export</h1>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${formattedData.map(row => `
            <tr>
              ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        Generated on ${new Date().toLocaleString()} - YorPro Legal Case Management System
      </div>
      <button onclick="window.print(); window.close();" style="margin-top: 20px; padding: 10px; background: #0f766e; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Print / Save as PDF
      </button>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}
