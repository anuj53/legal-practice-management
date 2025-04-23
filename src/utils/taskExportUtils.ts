
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { Task as UITask } from '@/components/tasks/TaskList';

/**
 * Gets the organization name for the current user
 */
async function getOrganizationName(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Legal Case Management System";
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();
      
    if (!profileData?.organization_id) return "Legal Case Management System";
    
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
 * Exports tasks to PDF format
 */
export async function exportTasksToPDF(tasks: UITask[]): Promise<void> {
  if (tasks.length === 0) return;
  
  try {
    // Get organization name for the footer
    const organizationName = await getOrganizationName();
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add header with logo and title
    doc.setFontSize(24);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('Tasks Report', 14, 20);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    
    // Create table data
    const tableData = tasks.map(task => [
      task.name,
      task.priority,
      task.status,
      task.taskType || '',
      task.assignee,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      task.matter || '',
    ]);
    
    // Define header and styling
    const headers = [
      'Task Name',
      'Priority',
      'Status',
      'Type',
      'Assignee',
      'Due Date',
      'Matter'
    ];
    
    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [51, 65, 85], // slate-700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
      },
      didParseCell: function(data) {
        // Color coding for priority and status
        if (data.row.index > 0) { // Skip header row
          if (data.column.index === 1) { // Priority column
            const priority = data.cell.text.toString();
            if (priority === 'High') {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            } else if (priority === 'Low') {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            }
          } else if (data.column.index === 2) { // Status column
            const status = data.cell.text.toString();
            if (status === 'Completed') {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            } else if (status === 'Overdue') {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            }
          }
        }
      },
    });
    
    // Add footer with organization name and page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      
      // Organization name in center
      doc.text(
        organizationName,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      
      // Page number on right
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save and download
    doc.save(`tasks_export_${new Date().toISOString().slice(0,10)}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
