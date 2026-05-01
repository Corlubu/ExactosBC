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
      custodianId: parseInt(custodianId),
    }),
  );

  const companySettingsQuery = useQuery(
    trpc.getCompanySettings.queryOptions({}),
  );

  const generatePdfMutation = useMutation(
    trpc.generateCustodianCertificatePdf.mutationOptions({
      custodianId: parseInt(custodianId),
    }),
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
        <div className="mx-auto max-w-5xl">
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading custody report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (custodianDataQuery.isError) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-5xl">
          <div className="py-12 text-center">
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
      <div className="mx-auto max-w-5xl">
        {/* Header - Hidden when printing */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate({ to: "/app/custodians" })}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Custodians
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Custody Certificate
              </h1>
              <p className="text-gray-600">
                Asset custody report for {custodian.firstName}{" "}
                {custodian.lastName}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Printer className="mr-2 h-5 w-5" />
                Print Certificate
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={generatePdfMutation.isPending}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatePdfMutation.isPending ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-5 w-5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Printable Certificate */}
        <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
          {/* Watermark - Only visible in print */}
          <div
            className="pointer-events-none fixed inset-0 z-10 hidden overflow-hidden print:block"
            style={{
              opacity: 0.05,
            }}
          >
            <div
              className="watermark-text absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-8xl font-bold"
              style={{
                transform: "translate(-50%, -50%) rotate(-45deg)",
                color: brandColor,
              }}
            >
              {companyName.toUpperCase()}
            </div>
          </div>

          {/* Certificate Header */}
          <div
            className="mb-8 border-b-2 pb-6 text-center"
            style={{ borderColor: brandColor }}
          >
            {companyLogo && (
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                className="mx-auto mb-4 h-16 object-contain"
              />
            )}
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <FileText className="h-8 w-8" style={{ color: brandColor }} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              CUSTODY CERTIFICATE
            </h2>
            <p className="text-gray-600">Fixed Asset Custody Acknowledgment</p>
            <p className="mt-2 text-sm text-gray-500">{companyName}</p>
          </div>

          {/* Custodian Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Custodian Information
            </h3>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Assets Under Custody ({assignments.length})
            </h3>

            {assignments.length === 0 ? (
              <div className="rounded-lg bg-gray-50 py-8 text-center">
                <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">
                  No assets currently assigned to this custodian
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="break-inside-avoid rounded-lg border border-gray-200 p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1 text-lg font-semibold text-gray-900">
                          {index + 1}. {assignment.asset.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Asset Tag:{" "}
                          <span className="font-medium">
                            {assignment.asset.assetTag}
                          </span>
                        </p>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: `${brandColor}20`,
                          color: brandColor,
                        }}
                      >
                        {assignment.asset.status}
                      </span>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600">
                          Fixed Asset Code
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.fixedAssetCode ||
                            assignment.asset.assetTag}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Date of Assignment
                        </p>
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
                        <p className="mb-1 text-sm text-gray-600">
                          Description
                        </p>
                        <p className="text-sm text-gray-900">
                          {assignment.briefDescription}
                        </p>
                      </div>
                    )}

                    {assignment.initialCondition && (
                      <div className="mb-3">
                        <p className="mb-1 text-sm text-gray-600">
                          Initial Condition
                        </p>
                        <p className="text-sm text-gray-900">
                          {assignment.initialCondition}
                        </p>
                      </div>
                    )}

                    {assignment.maintenanceObligations && (
                      <div className="mb-3">
                        <p className="mb-1 text-sm text-gray-600">
                          Maintenance Obligations
                        </p>
                        <p className="text-sm text-gray-900">
                          {assignment.maintenanceObligations}
                        </p>
                      </div>
                    )}

                    {assignment.asset.location && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-sm text-gray-600">
                          Location:{" "}
                          <span className="font-medium text-gray-900">
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
            <div
              className="mt-8 border-t-2 pt-6"
              style={{ borderColor: brandColor }}
            >
              <div className="mb-6">
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                  Custodian Acknowledgment
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  I,{" "}
                  <span className="font-semibold">
                    {custodian.firstName} {custodian.lastName}
                  </span>
                  , acknowledge receipt of the above-listed asset(s) and accept
                  responsibility for their proper care, maintenance, and
                  security. I understand that I am accountable for these assets
                  and agree to report any damage, loss, or theft immediately. I
                  will return the asset(s) in good condition upon request or
                  termination of my assignment.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div
                    className="border-t-2 pt-2"
                    style={{ borderColor: brandColor }}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Custodian Signature
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {custodian.firstName} {custodian.lastName}
                    </p>
                  </div>
                </div>
                <div>
                  <div
                    className="border-t-2 pt-2"
                    style={{ borderColor: brandColor }}
                  >
                    <p className="text-sm font-medium text-gray-900">Date</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <p className="text-center text-xs text-gray-500">
                  This document was generated on{" "}
                  {new Date().toLocaleDateString()} at{" "}
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
