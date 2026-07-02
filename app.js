// =========================================================
// THE APPLICATION LOG — job application tracker
// Vanilla JS, persisted to localStorage. No dependencies.
// =========================================================

(function () {
  "use strict";

  const STORAGE_KEY = "applicationLog.cases.v1";

  /** @type {Array<Object>} */
  let cases = [];
  let currentFilter = "all";
  let currentSort = "dateDesc";
  let searchTerm = "";

  // ---------- DOM references ----------
  const el = {
    ledgerBody: document.getElementById("ledgerBody"),
    emptyState: document.getElementById("emptyState"),
    ledgerWrap: document.querySelector(".ledger-wrap table"),
    statTotal: document.getElementById("statTotal"),
    statResponse: document.getElementById("statResponse"),
    statActive: document.getElementById("statActive"),
    statOffers: document.getElementById("statOffers"),
    statFollowup: document.getElementById("statFollowup"),
    statFollowupCard: document.getElementById("statFollowupCard"),
    statusTabs: document.getElementById("statusTabs"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    btnNew: document.getElementById("btnNew"),
    btnNewFromEmpty: document.getElementById("btnNewFromEmpty"),
    btnExport: document.getElementById("btnExport"),
    btnImport: document.getElementById("btnImport"),
    importFile: document.getElementById("importFile"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    modalClose: document.getElementById("modalClose"),
    form: document.getElementById("applicationForm"),
    btnCancel: document.getElementById("btnCancel"),
    btnDelete: document.getElementById("btnDelete"),
    toast: document.getElementById("toast"),
    fields: {
      id: document.getElementById("fieldId"),
      company: document.getElementById("fieldCompany"),
      position: document.getElementById("fieldPosition"),
      date: document.getElementById("fieldDate"),
      status: document.getElementById("fieldStatus"),
      location: document.getElementById("fieldLocation"),
      salary: document.getElementById("fieldSalary"),
      link: document.getElementById("fieldLink"),
      contact: document.getElementById("fieldContact"),
      followup: document.getElementById("fieldFollowup"),
      notes: document.getElementById("fieldNotes"),
    },
  };

  // ---------- Persistence ----------
  function loadCases() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cases = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Could not read saved cases:", e);
      cases = [];
    }
  }

  function saveCases() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.error("Could not save cases:", e);
      showToast("Storage is full or unavailable — changes may not persist.");
    }
  }

  // ---------- Utilities ----------
  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function daysBetween(isoDateA, isoDateB) {
    const a = new Date(isoDateA + "T00:00:00");
    const b = new Date(isoDateB + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.toast.hidden = true; }, 2400);
  }

  const RESPONDED_STATUSES = new Set(["Interviewing", "Offer", "Rejected"]);
  const ACTIVE_STATUSES = new Set(["Interviewing", "Offer"]);

  // ---------- Rendering ----------
  function render() {
    renderStats();
    renderTable();
  }

  function renderStats() {
    const total = cases.length;
    const responded = cases.filter((c) => RESPONDED_STATUSES.has(c.status)).length;
    const active = cases.filter((c) => ACTIVE_STATUSES.has(c.status)).length;
    const offers = cases.filter((c) => c.status === "Offer").length;
    const today = todayISO();
    const followupsDue = cases.filter((c) => c.followup && c.followup <= today).length;

    el.statTotal.textContent = String(total);
    el.statResponse.textContent = total === 0 ? "—" : Math.round((responded / total) * 100) + "%";
    el.statActive.textContent = String(active);
    el.statOffers.textContent = String(offers);
    el.statFollowup.textContent = String(followupsDue);
    el.statFollowupCard.classList.toggle("is-quiet", followupsDue === 0);
  }

  function getVisibleCases() {
    let list = cases.slice();

    if (currentFilter !== "all") {
      list = list.filter((c) => c.status === currentFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.company || "").toLowerCase().includes(q) ||
          (c.position || "").toLowerCase().includes(q)
      );
    }

    const today = todayISO();
    switch (currentSort) {
      case "dateAsc":
        list.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "companyAsc":
        list.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "followup":
        list.sort((a, b) => {
          const aDue = a.followup ? a.followup : "9999-99-99";
          const bDue = b.followup ? b.followup : "9999-99-99";
          return aDue.localeCompare(bDue);
        });
        break;
      case "dateDesc":
      default:
        list.sort((a, b) => b.date.localeCompare(a.date));
        break;
    }

    return list;
  }

  function renderTable() {
    const list = getVisibleCases();
    el.ledgerBody.innerHTML = "";

    if (cases.length === 0) {
      el.emptyState.hidden = false;
      el.emptyState.querySelector(".empty-title").textContent = "No cases open.";
      el.emptyState.querySelector(".empty-body").textContent =
        "Start your first file — log the company, the role, and the day you sent it in.";
      document.querySelector(".ledger-wrap table").style.display = "none";
      return;
    }

    if (list.length === 0) {
      el.emptyState.hidden = false;
      el.emptyState.querySelector(".empty-title").textContent = "No matches in this file drawer.";
      el.emptyState.querySelector(".empty-body").textContent =
        "Try a different search term or clear the current filter.";
      document.querySelector(".ledger-wrap table").style.display = "none";
      return;
    }

    el.emptyState.hidden = true;
    document.querySelector(".ledger-wrap table").style.display = "";

    const today = todayISO();

    for (const c of list) {
      const tr = document.createElement("tr");
      tr.dataset.id = c.id;

      const daysAgo = daysBetween(c.date, today);
      const daysLabel =
        daysAgo === 0 ? "today" : daysAgo === 1 ? "1 day ago" : daysAgo + " days ago";

      const followupDue = c.followup && c.followup <= today;
      const followupCell = c.followup
        ? `<span class="followup-chip ${followupDue ? "is-due" : ""}">${formatDate(c.followup)}</span>`
        : `<span class="followup-chip is-empty">—</span>`;

      const linkCell = c.link
        ? `<a class="link-icon" href="${escapeHtml(c.link)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">View ↗</a>`
        : `<span class="link-empty">—</span>`;

      tr.innerHTML = `
        <td class="cell-company">
          <span class="company-name">${escapeHtml(c.company)}</span><br>
          <span class="position-name">${escapeHtml(c.position)}</span>
        </td>
        <td class="cell-date">
          ${formatDate(c.date)}
          <span class="days-ago">${daysLabel}</span>
        </td>
        <td><span class="stamp stamp--${c.status}">${c.status}</span></td>
        <td>${followupCell}</td>
        <td>${linkCell}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" data-action="edit" title="Edit case" aria-label="Edit case">✎</button>
            <button class="icon-btn" data-action="delete" title="Delete case" aria-label="Delete case">🗑</button>
          </div>
        </td>
      `;

      tr.addEventListener("click", (e) => {
        if (e.target.closest("[data-action]") || e.target.closest("a")) return;
        openEditModal(c.id);
      });

      tr.querySelector('[data-action="edit"]').addEventListener("click", () => openEditModal(c.id));
      tr.querySelector('[data-action="delete"]').addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCase(c.id);
      });

      el.ledgerBody.appendChild(tr);
    }
  }

  // ---------- CRUD ----------
  function deleteCase(id) {
    const target = cases.find((c) => c.id === id);
    if (!target) return;
    if (!confirm(`Delete the case for ${target.company} — ${target.position}? This can't be undone.`)) return;
    cases = cases.filter((c) => c.id !== id);
    saveCases();
    render();
    showToast("Case deleted.");
  }

  function upsertFromForm() {
    const id = el.fields.id.value;
    const record = {
      id: id || uid(),
      company: el.fields.company.value.trim(),
      position: el.fields.position.value.trim(),
      date: el.fields.date.value,
      status: el.fields.status.value,
      location: el.fields.location.value.trim(),
      salary: el.fields.salary.value.trim(),
      link: el.fields.link.value.trim(),
      contact: el.fields.contact.value.trim(),
      followup: el.fields.followup.value,
      notes: el.fields.notes.value.trim(),
    };

    if (id) {
      const idx = cases.findIndex((c) => c.id === id);
      if (idx !== -1) cases[idx] = { ...cases[idx], ...record };
    } else {
      cases.unshift(record);
    }

    saveCases();
    render();
  }

  // ---------- Modal ----------
  function openNewModal() {
    el.form.reset();
    el.fields.id.value = "";
    el.fields.date.value = todayISO();
    el.fields.status.value = "Applied";
    el.modalTitle.textContent = "Open a new file";
    el.btnDelete.hidden = true;
    el.modalOverlay.hidden = false;
    setTimeout(() => el.fields.company.focus(), 50);
  }

  function openEditModal(id) {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    el.fields.id.value = c.id;
    el.fields.company.value = c.company || "";
    el.fields.position.value = c.position || "";
    el.fields.date.value = c.date || todayISO();
    el.fields.status.value = c.status || "Applied";
    el.fields.location.value = c.location || "";
    el.fields.salary.value = c.salary || "";
    el.fields.link.value = c.link || "";
    el.fields.contact.value = c.contact || "";
    el.fields.followup.value = c.followup || "";
    el.fields.notes.value = c.notes || "";
    el.modalTitle.textContent = `${c.company} — case file`;
    el.btnDelete.hidden = false;
    el.modalOverlay.hidden = false;
    setTimeout(() => el.fields.company.focus(), 50);
  }

  function closeModal() {
    el.modalOverlay.hidden = true;
  }

  // ---------- Import / Export ----------
  function exportCases() {
    const data = JSON.stringify(cases, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-log-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Exported your case file.");
  }

  function importCases(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error("File is not a case list.");
        const validated = imported
          .filter((c) => c && c.company && c.date)
          .map((c) => ({
            id: c.id || uid(),
            company: String(c.company),
            position: String(c.position || ""),
            date: String(c.date),
            status: c.status || "Applied",
            location: c.location || "",
            salary: c.salary || "",
            link: c.link || "",
            contact: c.contact || "",
            followup: c.followup || "",
            notes: c.notes || "",
          }));
        const existingIds = new Set(cases.map((c) => c.id));
        const merged = validated.filter((c) => !existingIds.has(c.id));
        cases = [...merged, ...cases];
        saveCases();
        render();
        showToast(`Imported ${merged.length} case${merged.length === 1 ? "" : "s"}.`);
      } catch (e) {
        console.error(e);
        alert("Couldn't read that file. Make sure it's a JSON export from this app.");
      }
    };
    reader.readAsText(file);
  }

  // ---------- Event wiring ----------
  el.btnNew.addEventListener("click", openNewModal);
  el.btnNewFromEmpty.addEventListener("click", openNewModal);
  el.modalClose.addEventListener("click", closeModal);
  el.btnCancel.addEventListener("click", closeModal);
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.modalOverlay.hidden) closeModal();
  });

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    upsertFromForm();
    closeModal();
    showToast("Case saved.");
  });

  el.btnDelete.addEventListener("click", () => {
    const id = el.fields.id.value;
    if (id) {
      closeModal();
      deleteCase(id);
    }
  });

  el.statusTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    currentFilter = btn.dataset.status;
    el.statusTabs.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("is-active", t === btn);
      t.setAttribute("aria-selected", t === btn ? "true" : "false");
    });
    renderTable();
  });

  el.searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderTable();
  });

  el.sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderTable();
  });

  el.btnExport.addEventListener("click", exportCases);
  el.btnImport.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) importCases(file);
    el.importFile.value = "";
  });

  // ---------- Seed sample data on first run ----------
  function seedIfEmpty() {
    if (cases.length > 0) return;
    const today = new Date();
    const iso = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().slice(0, 10);
    };
    const isoFuture = (daysAhead) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().slice(0, 10);
    };
    cases = [
      {
        id: uid(),
        company: "Nimbus Data Co.",
        position: "Senior Frontend Engineer",
        date: iso(3),
        status: "Applied",
        location: "Remote",
        salary: "$120k–140k",
        link: "https://example.com/jobs/nimbus-frontend",
        contact: "",
        followup: isoFuture(11),
        notes: "Applied via referral from Ana.",
      },
      {
        id: uid(),
        company: "Harbor & Finch",
        position: "Full-Stack Developer",
        date: iso(9),
        status: "Interviewing",
        location: "San Francisco, CA (hybrid)",
        salary: "",
        link: "https://example.com/jobs/harbor-finch",
        contact: "Priya Shah — recruiter",
        followup: iso(1),
        notes: "Technical interview scheduled — brush up on system design.",
      },
      {
        id: uid(),
        company: "Old Mill Software",
        position: "Node.js Engineer",
        date: iso(26),
        status: "Ghosted",
        location: "Remote",
        salary: "$100k–115k",
        link: "",
        contact: "",
        followup: "",
        notes: "No response after initial screening call.",
      },
    ];
    saveCases();
  }

  // ---------- Init ----------
  loadCases();
  seedIfEmpty();
  render();
})();
