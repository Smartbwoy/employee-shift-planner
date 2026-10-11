import DownloadDialog from "../ui/DownloadDialog";
import { formatWeekRange } from "../../lib/format";
import { downloadSchedule } from "../../lib/scheduleExport";

export default function ScheduleDownloadDialog({ weekStart, shifts, employees, onClose }) {
  return <DownloadDialog title="Download schedule" description={`${formatWeekRange(weekStart)} · Employee roster with daily shifts and days off.`} note={shifts.some(shift => !shift.isPublished) ? "This download includes unpublished draft shifts." : null} onDownload={format => downloadSchedule(format, weekStart, shifts, employees)} onClose={onClose} />;
}
