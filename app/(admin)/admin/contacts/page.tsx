import SubmissionCount from "../_components/submission-count";
import ContactsTable from "../_components/contacts-table";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Contact Submissions
          </h2>
          <p className="text-gray-600">
            View and manage contact form submissions
          </p>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          <SubmissionCount /> submissions
        </div>
      </div>

      {/* Contacts Table with Filtering */}
      <ContactsTable />
    </div>
  );
}
