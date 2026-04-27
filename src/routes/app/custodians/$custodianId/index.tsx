import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { ArrowLeft, Printer, FileText, Package, FileDown } from "lucide-react";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/app/custodians/$custodianId/")({
  component: CustodianDetailPage,
});

function CustodianDetailPage() {
  const { custodianId } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const custodianDataQuery = useQuery(
    trpc.getAssetsByCustodian.queryOptions({
      authToken: authToken || "",
      custodianId: parseInt(custodianId),
    })
  );

  const companySettingsQuery = useQuery(
    trpc.getCompanySettings.queryOptions({
      authToken: authToken || "",
    })
  );

  const generatePdfMutation = useMutation(
    trpc.generateCustodianCertificatePdf.mutationOptions({
      authToken: authToken || "",
      custodianId: parseInt(custodianId),
    })
  );

  const companyLogo = companySettingsQuery.data?.logoUrl;
  const brandColor = companySettingsQuery.data?.brandColor || "#3B82F6";
  const companyName = companySettingsQuery.data?.name || "Company";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const result = await generatePdfMutation.mutateAsync();
      
      // Open the download URL in a new tab to trigger download
      window.open(result.downloadUrl, "_blank");
      
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  if (custodianDataQuery.isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading custody report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (custodianDataQuery.isError) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading custody report</p>
            <button
              onClick={() => navigate({ to: "/app/custodians" })}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Custodians
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { custodian, assignments } = custodianDataQuery.data;

  return (
    <div className="p-8">
      <style>{`
        @media print {
          .watermark-text {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        {/* Header - Hidden when printing */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate({ to: "/app/custodians" })}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Custodians
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Custody Certificate
              </h1>
              <p className="text-gray-600">
                Asset custody report for {custodian.firstName} {custodian.lastName}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Certificate
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={generatePdfMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatePdfMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5 mr-2" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Printable Certificate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-0 relative">
          {/* Watermark - Only visible in print */}
          <div 
            className="hidden print:block fixed inset-0 pointer-events-none z-10 overflow-hidden"
            style={{ 
              opacity: 0.05,
            }}
          >
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-8xl font-bold watermark-text"
              style={{ 
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                color: brandColor,
              }}
            >
              {companyName.toUpperCase()}
            </div>
          </div>

          {/* Certificate Header */}
          <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: brandColor }}>
            {companyLogo && (
              <img 
                src={companyLogo} 
                alt={`${companyName} Logo`}
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <FileText className="w-8 h-8" style={{ color: brandColor }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              CUSTODY CERTIFICATE
            </h2>
            <p className="text-gray-600">Fixed Asset Custody Acknowledgment</p>
            <p className="text-sm text-gray-500 mt-2">{companyName}</p>
          </div>

          {/* Custodian Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Custodian Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-base font-medium text-gray-900">
                  {custodian.firstName} {custodian.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base font-medium text-gray-900">
                  {custodian.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position / Job Title</p>
                <p className="text-base font-medium text-gray-900">
                  {custodian.position || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Identification Number</p>
                <p className="text-base font-medium text-gray-900">
                  {custodian.identificationNumber || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Assets Under Custody */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assets Under Custody ({assignments.length})
            </h3>

            {assignments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No assets currently assigned to this custodian</p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-lg p-6 break-inside-avoid"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {index + 1}. {assignment.asset.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Asset Tag: <span className="font-medium">{assignment.asset.assetTag}</span>
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{ 
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        {assignment.asset.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Fixed Asset Code</p>
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.fixedAssetCode || assignment.asset.assetTag}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date of Assignment</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.asset.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Serial Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.asset.serialNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    {assignment.briefDescription && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-900">{assignment.briefDescription}</p>
                      </div>
                    )}

                    {assignment.initialCondition && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Initial Condition</p>
                        <p className="text-sm text-gray-900">{assignment.initialCondition}</p>
                      </div>
                    )}

                    {assignment.maintenanceObligations && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Maintenance Obligations</p>
                        <p className="text-sm text-gray-900">
                          {assignment.maintenanceObligations}
                        </p>
                      </div>
                    )}

                    {assignment.asset.location && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Location: <span className="font-medium text-gray-900">
                            {assignment.asset.location.name}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acknowledgment Section */}
          {assignments.length > 0 && (
            <div className="border-t-2 pt-6 mt-8" style={{ borderColor: brandColor }}>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Custodian Acknowledgment
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  I, <span className="font-semibold">{custodian.firstName} {custodian.lastName}</span>,
                  acknowledge receipt of the above-listed asset(s) and accept responsibility for their
                  proper care, maintenance, and security. I understand that I am accountable for these
                  assets and agree to report any damage, loss, or theft immediately. I will return the
                  asset(s) in good condition upon request or termination of my assignment.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12">
                <div>
                  <div className="border-t-2 pt-2" style={{ borderColor: brandColor }}>
                    <p className="text-sm font-medium text-gray-900">Custodian Signature</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {custodian.firstName} {custodian.lastName}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="border-t-2 pt-2" style={{ borderColor: brandColor }}>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  This document was generated on {new Date().toLocaleDateString()} at{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
