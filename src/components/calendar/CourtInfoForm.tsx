
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CourtInfoFormProps {
  courtInfo: {
    courtName?: string;
    judgeDetails?: string;
    docketNumber?: string;
  };
  setCourtInfo: (info: any) => void;
  disabled?: boolean;
}

export function CourtInfoForm({
  courtInfo,
  setCourtInfo,
  disabled = false
}: CourtInfoFormProps) {
  const handleChange = (field: string, value: string) => {
    setCourtInfo({ ...courtInfo, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="court-name" className="text-right">
          Court Name
        </Label>
        <Input
          type="text"
          id="court-name"
          value={courtInfo.courtName || ''}
          onChange={(e) => handleChange('courtName', e.target.value)}
          className="col-span-3"
          disabled={disabled}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="judge-details" className="text-right">
          Judge Details
        </Label>
        <Input
          type="text"
          id="judge-details"
          value={courtInfo.judgeDetails || ''}
          onChange={(e) => handleChange('judgeDetails', e.target.value)}
          className="col-span-3"
          disabled={disabled}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="docket-number" className="text-right">
          Docket Number
        </Label>
        <Input
          type="text"
          id="docket-number"
          value={courtInfo.docketNumber || ''}
          onChange={(e) => handleChange('docketNumber', e.target.value)}
          className="col-span-3"
          disabled={disabled}
        />
      </div>
    </>
  );
}
