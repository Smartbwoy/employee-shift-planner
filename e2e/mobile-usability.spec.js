const { test, expect } = require('@playwright/test');
const ExcelJS = require('exceljs');
const fs = require('fs');
const name = 'Alexandra-Josephine Montgomery-Richardson';
const employees = [{ employeeId:'E1', firstName:'Alexandra', fullName:name, positionTitle:'Server', positionId:1, active:true, maxWeeklyHours:40 }];
const shift = { id:10, employeeId:'E1', employeeName:name, startTime:'2026-10-12T08:00:00-05:00', endTime:'2026-10-12T16:00:00-05:00', role:'Server', breakMinutes:30, isPublished:false };
const report = { coveragePercent:100, totalHours:7.5, coverageGaps:0, labourCost:7500, regularHours:7.5, overtimeHours:0, currency:'JMD', regularLabourCost:7500, overtimeLabourCost:0, overtimeMultiplier:1.5, availabilityFitPercent:100, hoursByEmployee:[{ employeeId:'E1', fullName:name, hours:7.5 }], labourCostByEmployee:[{ employeeId:'E1', fullName:name, regularHours:7.5, overtimeHours:0, hourlyRate:1000, regularCost:7500, overtimeCost:0, totalCost:7500 }], coverageByDay:[{ day:'Monday', date:'2026-10-12', scheduledEmployees:1, requiredEmployees:1, hours:7.5, coveragePercent:100, isGap:false }] };
async function setup(page, role = 'Administrator', schedule = [shift]) {
  await page.clock.install({ time:new Date('2026-10-12T12:00:00Z') });
  await page.addInitScript(({ role }) => {
    localStorage.setItem('token','test-token');
    localStorage.setItem('user',JSON.stringify({ id:1, email:'test@example.com', role, employeeId:'E1' }));
  }, { role });
  await page.route('**/api/**', route => {
    const request = route.request(); const path = new URL(request.url()).pathname.toLowerCase();
    const json = data => route.fulfill({ json:data });
    if (request.method() !== 'GET') return json({ id:55, copiedShifts:1 });
    if (path.includes('/schedule/week/readiness')) return json({ isReady:true, issues:[] });
    if (path.includes('/schedule/candidates')) return json([{ employeeId:'E1', fullName:name, status:'Available' }]);
    if (path.includes('/schedule')) return json(schedule);
    if (path.includes('/reports/weekly')) return json(report);
    if (path.endsWith('/employee/roster')) return json(employees.map(e => ({ ...e, initial:'AM', availabilitySummary:'Available Monday–Friday', scheduledHours:7.5, status:'Available' })));
    if (path.endsWith('/employee/me')) return json(employees[0]);
    if (path.endsWith('/employee')) return json(employees);
    if (path.endsWith('/position')) return json([{ positionId:1,title:'Server',isActive:true }]);
    if (path.endsWith('/timeoffrequests')) return json([{ id:1, employeeName:name, employeeId:'E1', startDate:'2026-10-14', endDate:'2026-10-15', reason:'Family appointment with a long description', status:'Pending' }, { id:2, employeeName:name, startDate:'2026-10-01', endDate:'2026-10-02', reason:'Annual leave', reviewNotes:'Coverage arranged', status:'Approved' }]);
    if (path.endsWith('/operations/attendance')) return json([{ shiftId:10, employeeName:name, employeeId:'E1', shiftStart:shift.startTime, shiftEnd:shift.endTime, status:'Not recorded', scheduledHours:7.5, actualHours:null, lateMinutes:0 }]);
    if (path.endsWith('/operations/audit')) return json([{ id:1, category:'Shift', action:'Created', actor:'manager@example.com', createdAt:'2026-10-12T10:00:00Z', details:'Assigned to Alexandra-Josephine Montgomery-Richardson' }]);
    return json([]);
  });
}
async function noOverflow(page) {
  const overflow = await page.evaluate(() => ({ scroll:document.documentElement.scrollWidth, viewport:window.innerWidth }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.viewport + 1);
}

for (const width of [320,375,430,600,768,1024]) {
  test(`manager pages fit ${width}px with long employee names`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height:850 });
    await setup(page);
    for (const path of ['/schedule?week=2026-10-12','/employees','/create-shift?week=2026-10-12','/time-off','/operations','/reports?week=2026-10-12','/availability']) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.getByText('Fetching the latest data from the scheduler.')).toHaveCount(0);
      await test.step(`No overflow: ${path}`, () => noOverflow(page));
    }
  });
}

test('mobile shift dialog stays above navigation, traps focus and restores it', async ({ page }) => {
  await page.setViewportSize({ width:375,height:750 }); await setup(page);
  await page.goto('/schedule?week=2026-10-12');
  await page.getByRole('button', { name:new RegExp(name) }).click();
  const dialog = page.getByRole('dialog', { name:'Manage shift' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name:'Manage shift', exact:true })).toBeInViewport();
  expect(await dialog.evaluate(node => Math.round(node.getBoundingClientRect().height))).toBe(750);
  expect(await dialog.evaluate(node => Math.round(node.getBoundingClientRect().width))).toBe(375);
  expect(await dialog.evaluate(node => { const hit=document.elementFromPoint(20,window.innerHeight-20); return node.contains(hit); })).toBe(true);
  for (let i=0;i<18;i++) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name:new RegExp(name) })).toBeFocused();
  await page.getByRole('button', { name:'Filters', exact:true }).click();
  await page.getByPlaceholder('Search employees').fill('Alex');
  await expect(page.getByRole('button', { name:'Filters (1)' })).toBeVisible();
  await page.getByRole('button', { name:'Clear filters' }).click();
  await expect(page.getByPlaceholder('Search employees')).toHaveValue('');
});

test('employee home handles old shifts, swap requests and mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width:320,height:750 });
  await setup(page,'Employee',[{ ...shift,isPublished:true }]);
  await page.goto('/mobile');
  await expect(page.getByRole('navigation', { name:'Primary navigation' })).toBeVisible();
  await page.getByRole('button', { name:'Request swap' }).click();
  await page.getByLabel('Reason').fill('Family appointment');
  await page.getByRole('button', { name:'Submit request', exact:true }).click();
  await expect(page.getByText('Swap request submitted for manager review.')).toBeVisible();
  await page.getByRole('button', { name:'More', exact:true }).click();
  await expect(page.getByRole('button', { name:'Log out', exact:true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.route('**/api/Schedule?*', route => route.fulfill({ json:[{ ...shift,startTime:'2026-10-11T08:00:00-05:00',endTime:'2026-10-11T16:00:00-05:00' }] }));
  await page.reload();
  await expect(page.getByText('No upcoming shifts', { exact:true })).toBeVisible();
  await noOverflow(page);
});

test('create and publish require reviews and report downloads contain real files', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:375,height:850 }); await setup(page);
  await page.goto('/create-shift?week=2026-10-12');
  await expect(page.getByRole('button', { name:'Review shift', exact:true })).toBeDisabled();
  await page.getByRole('combobox', { name:'Role', exact:true }).selectOption('Server');
  await page.getByRole('radio').check();
  await page.getByRole('button', { name:'Review shift', exact:true }).click();
  await expect(page.getByText(/Employees will see it when you publish/)).toBeVisible();
  await page.getByRole('button', { name:'Save draft', exact:true }).click();
  await expect(page).toHaveURL(/schedule/);
  await page.getByRole('button', { name:/Publish week/ }).click();
  await expect(page.getByRole('dialog', { name:'Review before publishing' })).toBeVisible();
  await page.getByRole('button', { name:'Back to schedule' }).click();
  await page.goto('/reports?week=2026-10-12');
  await page.getByRole('button', { name:'Download report', exact:true }).click();
  await page.getByLabel('File format').selectOption('excel');
  const excelDownload = page.waitForEvent('download');
  await page.getByRole('button', { name:'Download Excel', exact:true }).click();
  const excel = await excelDownload;
  expect(excel.suggestedFilename()).toMatch(/\.xlsx$/);
  const book = new ExcelJS.Workbook(); await book.xlsx.readFile(await excel.path());
  expect(book.worksheets.map(sheet => sheet.name)).toEqual(['Employee hours','Labour cost','Coverage']);
  expect(book.worksheets[0].getCell('A3').value).toBe(name);
  await page.getByRole('button', { name:'Download report', exact:true }).click();
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name:'Download PDF', exact:true }).click();
  const pdf = await pdfDownload;
  expect(fs.readFileSync(await pdf.path()).subarray(0,5).toString()).toBe('%PDF-');
  await page.screenshot({ path:testInfo.outputPath('reports-mobile.png'),fullPage:true });
});

test('employee home distinguishes slow loading, empty schedules and failures', async ({ page }) => {
  await page.setViewportSize({ width:375,height:750 }); await setup(page,'Employee',[]);
  let release;
  const gate = new Promise(resolve => { release=resolve; });
  await page.route('**/api/Schedule?*', async route => { await gate; await route.fulfill({ json:[] }); });
  await page.goto('/mobile');
  await expect(page.getByText('Loading your schedule…', { exact:true })).toBeVisible();
  await expect(page.getByText('No upcoming shifts', { exact:true })).toHaveCount(0);
  release();
  await expect(page.getByText('No upcoming shifts', { exact:true })).toBeVisible();
  await page.route('**/api/Schedule?*', route => route.fulfill({ status:403,json:{ message:'Access denied' } }));
  await page.reload();
  await expect(page.getByText('Could not load your shifts', { exact:true })).toBeVisible();
  await expect(page.getByText('No upcoming shifts', { exact:true })).toHaveCount(0);
});

test('reduced-height mobile editing keeps review actions accessible and blocks conflicting publication', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:375,height:850 }); await setup(page);
  await page.goto('/create-shift?week=2026-10-12');
  await page.getByRole('combobox', { name:'Role', exact:true }).selectOption('Server');
  await page.getByRole('radio').check();
  await page.setViewportSize({ width:375,height:430 });
  await page.getByLabel('Notes', { exact:true }).focus();
  await expect(page.getByRole('button', { name:'Review shift', exact:true })).toBeInViewport();
  await page.getByRole('button', { name:'Review shift', exact:true }).click();
  await expect(page.getByRole('dialog', { name:'Review shift' })).toBeVisible();
  await page.getByRole('button', { name:'Back to editing', exact:true }).click();
  await page.route('**/api/Schedule/week/readiness?*', route => route.fulfill({ json:{ isReady:false,issues:[{ shiftId:10,errors:['Employee unavailable'] }] } }));
  await page.setViewportSize({ width:375,height:850 });
  await page.goto('/schedule?week=2026-10-12');
  await page.screenshot({ path:testInfo.outputPath('schedule-mobile.png'),fullPage:true });
  await page.getByRole('button', { name:/Publish week/ }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name:'Publish week',exact:true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name:new RegExp(name) }).click();
  await page.screenshot({ path:testInfo.outputPath('shift-editor-mobile.png') });
});
