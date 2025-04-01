import { Contact } from '@/types/contact';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

export type ExportColumnOption = 'all' | 'visible';

/**
 * Formats contact data for export
 */
export function formatContactsForExport(
  contacts: Contact[], 
  columnOption: ExportColumnOption = 'all'
): Record<string, string>[] {
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
    
    const basicContactFields = {
      'Name': contactName,
      'Type': contactType,
      'Email': primaryEmail,
      'Phone': primaryPhone,
      'Address': formattedAddress,
      'Notes': contact.notes || '',
      'Client': contact.is_client ? 'Yes' : 'No'
    };
    
    // For 'all' columns, add additional fields
    if (columnOption === 'all') {
      return {
        ...basicContactFields,
        'Job Title': contact.job_title || '',
        'Date of Birth': contact.date_of_birth || '',
        'Additional Emails': contact.emails?.filter(e => !e.is_primary).map(e => e.email).join(', ') || '',
        'Additional Phones': contact.phones?.filter(p => !p.is_primary).map(p => p.phone).join(', ') || '',
        'Websites': contact.websites?.map(w => w.url).join(', ') || '',
        'Additional Addresses': contact.addresses?.filter(a => !a.is_primary).length 
          ? contact.addresses.filter(a => !a.is_primary).map(a => 
              `${a.street}, ${a.city}, ${a.state} ${a.zip}, ${a.country} (${a.type})`
            ).join('; ')
          : '',
        'Tags': contact.tags?.map(tag => tag.name).join(', ') || '',
        'Billing Rate': contact.billing_rate ? `$${contact.billing_rate}` : '',
        'Payment Profile': contact.payment_profile || '',
        'Created At': new Date(contact.created_at).toLocaleDateString(),
      };
    }
    
    return basicContactFields;
  });
}

/**
 * Exports contacts to CSV format
 */
export function exportContactsToCSV(contacts: Contact[], columnOption: ExportColumnOption = 'all'): void {
  const formattedData = formatContactsForExport(contacts, columnOption);
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
 * Gets the organization name for the current user
 */
async function getOrganizationName(): Promise<string> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return "Legal Case Management System";
    
    // Get user's profile with organization_id
    const { data: profileData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();
      
    if (!profileData?.organization_id) return "Legal Case Management System";
    
    // Get organization name
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profileData.organization_id)
      .maybeSingle();
      
    return orgData?.name || "Legal Case Management System";
  } catch (error) {
    console.error('Error fetching organization name:', error);
    return "Legal Case Management System";
  }
}

/**
 * Exports contacts to PDF format with direct download
 */
export async function exportContactsToPDF(contacts: Contact[]): Promise<void> {
  const formattedData = formatContactsForExport(contacts, 'visible');
  if (formattedData.length === 0) return;
  
  try {
    // Get organization name for the footer
    const organizationName = await getOrganizationName();
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Contacts Export', 14, 22);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    
    // Extract headers and data for the table
    const headers = Object.keys(formattedData[0]);
    const data = formattedData.map(row => headers.map(header => row[header] || ''));
    
    // Create table
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 35,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Footer with page numbers - Fix for the TypeScript error
    // Use doc.getNumberOfPages() instead of doc.internal.getNumberOfPages()
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        organizationName,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save and download the PDF
    doc.save(`contacts_export_${new Date().toISOString().slice(0,10)}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
