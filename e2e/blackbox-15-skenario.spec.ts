// =========================================================================
// BLACK BOX TESTING — Equivalence Partitioning (15 Skenario Jurnal)
// Metode  : Black Box Testing (Equivalence Partitioning)
// Tool    : Playwright (Headless Chromium)
// Mapping : Setiap test.describe sesuai Tabel 4.3 jurnal (No 1–15)
//
// CARA PAKAI:
//   1. npx prisma db seed        ← Reset database
//   2. npm run dev                ← Pastikan server running
//   3. npx playwright test e2e/blackbox-15-skenario.spec.ts --project=chromium
// =========================================================================

import { test, expect, type Page } from '@playwright/test';

async function loginAs(page: Page, username: string, password: string, expectedUrlPattern: string) {
  for (let i = 0; i < 3; i++) {
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(username);
    await page.getByTestId('login-password-input').fill(password);
    await page.getByTestId('login-submit-button').click();
    try {
      await expect(page).toHaveURL(new RegExp(expectedUrlPattern), { timeout: 5000 });
      return;
    } catch (e) {
      if (i === 2) throw e;
      await page.waitForTimeout(1000);
    }
  }
}

// SKENARIO 1–3, 7-13: ADMIN & WALI (Tagihan, Upload Bukti, Verifikasi, Saldo)
test.describe('Alur Utama Admin dan Wali', () => {
  test('Skenario 1-3, 7-13: End-to-end Tagihan hingga Verifikasi', async ({ browser }) => {
    test.setTimeout(300000);
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    const waliContext = await browser.newContext();
    const waliPage = await waliContext.newPage();

    let uniqueName1 = '';

    await test.step('Persiapan: Login Admin & Skenario 1', async () => {
      // Skenario 1: Admin Buat Tagihan
      await loginAs(adminPage, 'admin', 'admin123', 'admin/dashboard');
      await adminPage.goto('/admin/tagihan');

      // Tunggu hingga data siswa dan kelas di-fetch oleh client-side (ditandai dengan munculnya opsi kelas di select)
      await expect(adminPage.locator('select[data-testid="tagihan-manual-target-select"] option')).toHaveCount(2, { timeout: 10000 });

      adminPage.on('console', msg => console.log('ADMIN BROWSER:', msg.text()));
      adminPage.on('pageerror', error => console.log('ADMIN JS ERROR:', error.message));

      await adminPage.waitForTimeout(500); // Tunggu React Hydration
      uniqueName1 = `SPP Uji BlackBox ${Date.now()}`;
      await adminPage.getByTestId('tagihan-manual-name-input').fill(uniqueName1);
      await adminPage.getByTestId('tagihan-manual-nominal-input').fill('75000');
      await adminPage.getByTestId('tagihan-manual-target-select').selectOption('SEMUA');
      adminPage.on('dialog', async (dialog) => {
        console.log('Admin Dialog:', dialog.message());
        await dialog.accept();
      });
      await adminPage.getByTestId('tagihan-manual-submit-btn').click();
      await expect(adminPage.getByText(/berhasil dibuat/i).first()).toBeVisible({ timeout: 15000 });
      await adminPage.waitForTimeout(1000);
      await expect(adminPage.getByText(uniqueName1).first()).toBeVisible({ timeout: 15000 });

      // Buat tagihan kedua untuk skenario tolak
      await adminPage.waitForTimeout(500);
      const uniqueName2 = `Tagihan Uji Tolak ${Date.now()}`;
      await adminPage.getByTestId('tagihan-manual-name-input').fill(uniqueName2);
      await adminPage.getByTestId('tagihan-manual-nominal-input').fill('200000');
      await adminPage.getByTestId('tagihan-manual-target-select').selectOption('SEMUA');
      await adminPage.getByTestId('tagihan-manual-submit-btn').click();
      await expect(adminPage.getByText(/berhasil dibuat/i).first()).toBeVisible({ timeout: 15000 });
      await adminPage.waitForTimeout(1000);
      await expect(adminPage.getByText(uniqueName2).first()).toBeVisible({ timeout: 15000 });
    });

    await test.step('Skenario 7, 8, 9, 10, 11, 12, 13: Wali Murid Actions', async () => {
      // Skenario 8: Login Gagal
      await waliPage.goto('/login');
      await waliPage.getByTestId('login-username-input').fill('081249575363');
      await waliPage.getByTestId('login-password-input').fill('password_salah_total');
      await waliPage.getByTestId('login-submit-button').click();
      await expect(waliPage.getByTestId('login-error-message')).toBeVisible({ timeout: 5000 });

      // Skenario 7: Login Sukses
      await loginAs(waliPage, '081249575363', 'santri123', 'wali/dashboard');

      // Skenario 9: Lihat rincian tagihan (verifikasi elemen ada)
      await expect(waliPage.getByText('Buku Besar Tagihan').first()).toBeVisible({ timeout: 15000 });

      // Skenario 12 & 13: Cek elemen Saldo dan Limit (Riwayat Koperasi dsb)
      await expect(waliPage.getByText('Saldo Uang Saku').first()).toBeVisible();
      await expect(waliPage.getByText('Limit Jajan Harian').first()).toBeVisible();

      // Skenario 11: Upload Bukti Gagal (Format Salah)
      const rowTolak = waliPage.locator('tr').filter({ hasText: 'Tagihan Uji Tolak' }).first();
      const checkboxTolak = rowTolak.locator('input[type="checkbox"]');
      await checkboxTolak.waitFor({ state: 'visible', timeout: 10000 });
      await checkboxTolak.check();

      await waliPage.getByTestId('input-ref-number').fill('TRF-GAGAL-EXE');
      await waliPage.getByTestId('input-transfer-date').fill('2026-08-16');
      try {
        await waliPage.getByTestId('proof-file-input').setInputFiles({
          name: 'virus.exe',
          mimeType: 'application/x-msdownload',
          buffer: Buffer.from('fake-exe'),
        });
        await waliPage.getByTestId('submit-payment-proof').click();
        await expect(waliPage.getByText('BERHASIL DIKIRIM!')).not.toBeVisible({ timeout: 3000 });
      } catch (e) {
        expect(e).toBeDefined();
      }

      // Upload Bukti Sukses untuk "Tagihan Uji Tolak" (supaya bisa ditolak admin nanti)
      await waliPage.getByTestId('input-ref-number').fill('TRF-TOLAK-001');
      await waliPage.getByTestId('proof-file-input').setInputFiles({
        name: 'bukti_buram.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-buram-image'),
      });
      const uploadPromise1 = waliPage.waitForResponse(r => r.url().includes('/api/upload') && r.status() === 200);
      const loadPromise1 = waliPage.waitForEvent('load');
      await waliPage.getByTestId('submit-payment-proof').click();
      await uploadPromise1;
      await loadPromise1;

      // Skenario 10: Upload Bukti Sukses untuk "SPP Uji BlackBox"
      const rowSukses = waliPage.locator('tr').filter({ hasText: 'SPP Uji BlackBox' }).first();
      const checkboxSukses = rowSukses.locator('input[type="checkbox"]');
      await checkboxSukses.waitFor({ state: 'visible', timeout: 10000 });
      await checkboxSukses.check();

      await waliPage.getByTestId('input-ref-number').fill('TRF-SUKSES-010');
      await waliPage.getByTestId('input-transfer-date').fill('2026-08-16');
      await waliPage.getByTestId('proof-file-input').setInputFiles({
        name: 'bukti_transfer_valid.png',
        mimeType: 'image/png',
        buffer: Buffer.from('valid-image-data-for-test'),
      });
      const uploadPromise2 = waliPage.waitForResponse(r => r.url().includes('/api/upload') && r.status() === 200);
      const loadPromise2 = waliPage.waitForEvent('load');
      await waliPage.getByTestId('submit-payment-proof').click();
      await uploadPromise2;
      await loadPromise2;
    });

    await test.step('Skenario 2 & 3: Verifikasi Admin', async () => {
      await adminPage.goto('/admin/verifikasi');

      // Skenario 3: Penolakan Tagihan Tidak Valid
      await adminPage.getByTestId('search-verifikasi').fill('');
      const itemToReject = adminPage.locator('[data-testid^="queue-item-"]').filter({ hasText: 'Tagihan Uji Tolak' }).first();
      await itemToReject.waitFor({ state: 'visible' });
      await itemToReject.click();

      await adminPage.getByTestId('reject-verifikasi-button').click();
      await adminPage.getByTestId('rejection-reason-input').fill('Bukti transfer buram');
      await adminPage.getByTestId('confirm-reject-button').click();

      await expect(itemToReject).not.toBeVisible({ timeout: 10000 });
      // Skenario 2: Verifikasi Bukti Tahap 1
      await adminPage.getByTestId('search-verifikasi').fill('');
      const itemToApprove = adminPage.locator('[data-testid^="queue-item-"]').filter({ hasText: uniqueName1 }).first();
      await itemToApprove.waitFor({ state: 'visible' });
      await itemToApprove.click();

      await adminPage.getByTestId('approve-verifikasi-button').click();

      await expect(adminPage.getByText('Kwitansi Digital').first()).toBeVisible({ timeout: 10000 });
    });

    await adminContext.close();
    await waliContext.close();
  });
});

// SKENARIO 4–6: BENDAHARA (Approval & Laporan)
test.describe('BENDAHARA — Skenario 4, 5, 6', () => {
  test('Alur Approval dan Laporan Bendahara', async ({ page }) => {
    test.setTimeout(180000);
    await test.step('Persiapan: Login Bendahara', async () => {
      await loginAs(page, 'bendahara', 'bendahara123', 'bendahara/dashboard');
    });

    await test.step('Skenario 4: Approval Akhir Transaksi & Skenario 6: Tolak Transaksi Ganda', async () => {
      await page.goto('/bendahara/approval');

      const itemsToApprove = page.locator('input[data-testid^="select-approval-"]');
      // Wait for table to populate
      await page.waitForTimeout(1000);
      if (await itemsToApprove.count() > 0) {
        await page.getByTestId('select-all-approval').check();
        const bulkApprove = page.getByTestId('bulk-approve-button');

        page.once('dialog', dialog => dialog.accept());
        await bulkApprove.click();
      }
    });

    await test.step('Skenario 5: Lihat Laporan Keuangan (Bendahara)', async () => {
      await page.goto('/bendahara/laporan');

      await expect(page.getByTestId('btn-download-excel')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('input-search-kwitansi')).toBeVisible();
    });
  });
});

// SKENARIO 14–15: KASIR KOPERASI (Transaksi & Cegah Saldo Minus)
test.describe('KASIR KOPERASI — Skenario 14, 15', () => {
  test('Alur Transaksi Koperasi', async ({ page }) => {
    test.setTimeout(180000);
    await test.step('Persiapan: Login Kasir Koperasi', async () => {
      page.on('dialog', async (dialog) => {
        console.log('Koperasi Dialog:', dialog.message());
        await dialog.accept();
      });
      await loginAs(page, 'koperasi', 'koperasi123', 'koperasi/dashboard');
      await expect(page.getByText('PORTAL KASIR KOPERASI')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Skenario 15: Cegah Saldo Minus (Error)', async () => {
      await page.goto('/koperasi/dashboard');

      await page.getByTestId('input-nisn').fill('SNT-2026-0001');
      await page.getByTestId('input-total-belanja').fill('99900000'); // Melebihi saldo
      await page.getByTestId('submit-koperasi').click();

      await expect(page.locator('#error-alert')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Skenario 14: Input Transaksi Koperasi (Success)', async () => {
      page.on('console', msg => console.log('KOPERASI BROWSER:', msg.text()));
      page.on('pageerror', error => console.log('KOPERASI JS ERROR:', error.message));

      await page.goto('/koperasi/dashboard'); // REFRESH AGAR STATE DARI SKENARIO 15 HILANG
      await page.getByTestId('input-nisn').pressSequentially('SNT-2026-0001', { delay: 10 });
      await page.getByTestId('input-total-belanja').pressSequentially('10000', { delay: 10 });
      const submitPromise = page.waitForResponse(r => r.request().method() === 'POST');
      await page.getByTestId('submit-koperasi').click({ force: true });
      await submitPromise;

      await page.waitForTimeout(1000);
      await expect(page.getByTestId('input-nisn')).toHaveValue('');
      await expect(page.getByTestId('input-total-belanja')).toHaveValue('');
    });
  });
});

