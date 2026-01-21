"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreVertical, 
  Edit, 
  UserCog, 
  Ban, 
  CheckCircle,
  Trash2,
  Shield,
  Key,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface UserActionsMenuProps {
  userId: string;
  userName: string;
  userRole: string;
}

export default function UserActionsMenu({ userId, userName, userRole }: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (action: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Er is een fout opgetreden");
      }
    } catch (error) {
      alert("Er is een fout opgetreden");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Weet je zeker dat je ${userName} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Er is een fout opgetreden");
      }
    } catch (error) {
      alert("Er is een fout opgetreden");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg"
        disabled={loading}
      >
        <MoreVertical className="w-4 h-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          <Link
            href={`/admin/users/${userId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Edit className="w-4 h-4" />
            Bewerken
          </Link>
          
          <Link
            href={`/admin/users/${userId}/subscriptions`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <UserCog className="w-4 h-4" />
            Abonnementen
          </Link>

          <button
            onClick={() => handleAction("reset_password")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Key className="w-4 h-4" />
            Reset Wachtwoord
          </button>

          <hr className="my-1 border-slate-200" />

          {userRole === "customer" && (
            <button
              onClick={() => handleAction("make_admin")}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-slate-50"
            >
              <Shield className="w-4 h-4" />
              Maak Admin
            </button>
          )}

          {userRole === "admin" && (
            <button
              onClick={() => handleAction("remove_admin")}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Shield className="w-4 h-4" />
              Verwijder Admin
            </button>
          )}

          <button
            onClick={() => handleAction("toggle_active")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-slate-50"
          >
            <Ban className="w-4 h-4" />
            Activeer/Deactiveer
          </button>

          <hr className="my-1 border-slate-200" />

          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Verwijderen
          </button>
        </div>
      )}
    </div>
  );
}
