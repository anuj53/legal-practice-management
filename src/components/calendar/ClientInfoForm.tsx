
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientInfoFormProps {
  clientInfo: {
    caseId?: string;
    clientName?: string;
    assignedLawyer?: string;
  };
  setClientInfo: (info: any) => void;
  disabled?: boolean;
}

export function ClientInfoForm({
  clientInfo,
  setClientInfo,
  disabled = false
}: ClientInfoFormProps) {
  const handleChange = (field: string, value: string) => {
    setClientInfo({ ...clientInfo, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="case-id" className="text-right">
          Case ID
        </Label>
        <Input
          type="text"
          id="case-id"
          value={clientInfo.caseId || ''}
          onChange={(e) => handleChange('caseId', e.target.value)}
          className="col-span-3"
          disabled={disabled}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="client-name" className="text-right">
          Client Name
        </Label>
        <Input
          type="text"
          id="client-name"
          value={clientInfo.clientName || ''}
          onChange={(e) => handleChange('clientName', e.target.value)}
          className="col-span-3"
          disabled={disabled}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="assigned-lawyer" className="text-right">
          Assigned Lawyer
        </Label>
        <Input
          type="text"
          id="assigned-lawyer"
          value={clientInfo.assignedLawyer || ''}
          onChange={(e) => handleChange('assignedLawyer', e.target.value)}
          className="col-span-3"
          disabled={disabled}
        />
      </div>
    </>
  );
}
