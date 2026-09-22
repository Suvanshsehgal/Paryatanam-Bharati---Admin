const fs = require('fs');
let code = fs.readFileSync('D:/Projects/ParyatanamBharti-admin/admin/src/pages/WellnessPage.jsx', 'utf8');

// 1. Providers
// Remove isCreateProvOpen
code = code.replace(/const \[isCreateProvOpen.*?\n/g, '');
// Remove createProviderMutation
code = code.replace(/const createProviderMutation = useMutation\({[\s\S]*?onError: \(err\) => toast\.error\('Creation Error', err\.detail \|\| err\.message\),\s*}\);\s*/, '');
// Remove Register Center button
code = code.replace(/<button\s+onClick=\{\(\) => \{\s+setProvForm\(\{[\s\S]*?<\/button>\s*<\/div>/, '</div>');
// Remove provFeatured filter
code = code.replace(/<div className="w-36">\s*<select\s+value=\{provFeatured\}[\s\S]*?<\/select>\s*<\/div>/, '');
// Remove Provider create modal
code = code.replace(/\{\/\* 3\. Register Provider Modal \*\/\}(.|\n)*?\{\/\* 4\. Edit Provider/m, '{/* 4. Edit Provider');
// Edit Provider Modal - keep only curation toggles
code = code.replace(/<form[\s\S]*?\{\/\* 5\. Provider Detail/m, (match) => {
    return `<form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editingProv?.id) return;
            updateProviderMutation.mutate({
              id: editingProv.id,
              data: {
                is_featured: provForm.is_featured,
                is_active: provForm.is_active,
              },
            });
          }}
          className="space-y-4"
        >
          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 space-y-2">
            <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300">Curation Toggles</h4>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Featured Center (Promoted on Discovery)</label>
              <input
                type="checkbox"
                checked={provForm.is_featured}
                onChange={(e) => setProvForm({ ...provForm, is_featured: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Active & Operable</label>
              <input
                type="checkbox"
                checked={provForm.is_active}
                onChange={(e) => setProvForm({ ...provForm, is_active: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditProvOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProviderMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {updateProviderMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Curation Flags</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Provider Detail`;
});


// 2. Services
// Remove isCreateServOpen
code = code.replace(/const \[isCreateServOpen.*?\n/g, '');
// Remove createServiceMutation
code = code.replace(/const createServiceMutation = useMutation\({[\s\S]*?onError: \(err\) => toast\.error\('Creation Error', err\.detail \|\| err\.message\),\s*}\);\s*/, '');
// Remove Add Service button
code = code.replace(/<button\s+onClick=\{\(\) => \{\s+setServForm\(\{[\s\S]*?<\/button>\s*<\/div>/, '</div>');
// Remove servPublished filter
code = code.replace(/<div className="w-36">\s*<select\s+value=\{servPublished\}[\s\S]*?<\/select>\s*<\/div>/, '');
// Remove Service create modal
code = code.replace(/\{\/\* 6\. Create Service Modal \*\/\}(.|\n)*?\{\/\* 7\. Edit Service/m, '{/* 7. Edit Service');
// Edit Service Modal - keep only curation toggles
code = code.replace(/\{\/\* 7\. Edit Service(.|\n)*?\{\/\* 8\. Service Detail/m, (match) => {
    return `{/* 7. Edit Service & Curation Flags Modal */}
      <Modal
        isOpen={isEditServOpen}
        onClose={() => setIsEditServOpen(false)}
        title="Update Treatment Service Curation"
        subtitle={\`Updating details for \${editingServ?.name || 'Treatment Service'}\`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editingServ?.id) return;
            updateServiceMutation.mutate({
              id: editingServ.id,
              data: {
                is_featured: servForm.is_featured,
                is_active: servForm.is_active,
              },
            });
          }}
          className="space-y-4"
        >
          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 space-y-2">
            <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300">Curation Toggles</h4>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Featured Service</label>
              <input
                type="checkbox"
                checked={servForm.is_featured}
                onChange={(e) => setServForm({ ...servForm, is_featured: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Active & Enabled</label>
              <input
                type="checkbox"
                checked={servForm.is_active}
                onChange={(e) => setServForm({ ...servForm, is_active: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditServOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateServiceMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {updateServiceMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Service Detail`;
});


// 3. Bookings
// restrict bookStatus default
code = code.replace(/const \[bookStatus, setBookStatus\] = useState\(''\);/, "const [bookStatus, setBookStatus] = useState('CONFIRMED');");
// Change dropdown in filter
code = code.replace(/<select\s+value=\{bookStatus\}[\s\S]*?<\/select>/, `<select
                value={bookStatus}
                onChange={(e) => setBookStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>`);

// Map Bookings columns strictly
code = code.replace(/const bookingColumns = \[[\s\S]*?\];/m, `const bookingColumns = [
    {
      header: 'Booking Ref',
      accessorKey: 'booking_reference',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
            {row?.booking_reference || (row?.id ? row.id.slice(0, 8) : 'N/A')}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'user.name',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{row?.user?.name || 'Customer'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Center & Service',
      cell: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{row?.service?.name || 'Treatment Service'}</div>
          <div className="text-[11px] text-slate-400">{row?.provider?.name || 'Wellness Center'}</div>
        </div>
      ),
    },
    {
      header: 'Appointment Date',
      accessorKey: 'booking_date',
      cell: (row) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <div className="font-semibold flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-orange-500" />
            <span>{row?.booking_date || 'N/A'}</span>
          </div>
          <div className="text-[10px] text-slate-400">{row?.start_time || 'Scheduled Slot'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row?.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => updateBookingStatusMutation.mutate({ id: row.id, status: 'COMPLETED' })}
            className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          >
            COMPLETE
          </button>
          <button
            onClick={() => updateBookingStatusMutation.mutate({ id: row.id, status: 'CANCELLED' })}
            className="px-2 py-1 text-[10px] font-bold rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
          >
            CANCEL
          </button>
        </div>
      ),
    },
  ];`);

// Remove change booking status modal
code = code.replace(/\{\/\* 10\. Change Booking Status Modal \*\/\}(.|\n)*?\{\/\* 11\. Delete Confirmations/m, '{/* 11. Delete Confirmations');

// Remove email/phone from booking details
code = code.replace(/<div className="text-slate-400">\{bookDetail\.user_email \|\| ''\}<\/div>\s*<div className="text-slate-400">\{bookDetail\.user_phone \|\| ''\}<\/div>/, '');

fs.writeFileSync('D:/Projects/ParyatanamBharti-admin/admin/src/pages/WellnessPage.jsx', code);
console.log('Modifications done.');
