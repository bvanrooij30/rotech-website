import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AccountForm from "@/components/portal/AccountForm";
import PasswordForm from "@/components/portal/PasswordForm";

export const metadata = {
  title: "Instellingen",
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/portal/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      companyName: true,
      kvkNumber: true,
      vatNumber: true,
      street: true,
      houseNumber: true,
      postalCode: true,
      city: true,
      country: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    redirect("/portal/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Instellingen</h1>
        <p className="text-slate-600">Beheer je accountgegevens en voorkeuren.</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Persoonlijke gegevens</h2>
        <AccountForm user={user} />
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Bedrijfsgegevens</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bedrijfsnaam
            </label>
            <p className="text-slate-900">{user.companyName || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              KvK-nummer
            </label>
            <p className="text-slate-900">{user.kvkNumber || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              BTW-nummer
            </label>
            <p className="text-slate-900">{user.vatNumber || "-"}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Adresgegevens</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Straat + huisnummer
            </label>
            <p className="text-slate-900">
              {user.street && user.houseNumber
                ? `${user.street} ${user.houseNumber}`
                : "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Postcode + plaats
            </label>
            <p className="text-slate-900">
              {user.postalCode && user.city
                ? `${user.postalCode} ${user.city}`
                : "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Land
            </label>
            <p className="text-slate-900">{user.country || "-"}</p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Wachtwoord wijzigen</h2>
        <PasswordForm />
      </div>

      {/* Account Info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Accountinformatie</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Account aangemaakt</label>
            <p className="text-slate-600">
              {new Date(user.createdAt).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {user.lastLoginAt && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Laatste login</label>
              <p className="text-slate-600">
                {new Date(user.lastLoginAt).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
