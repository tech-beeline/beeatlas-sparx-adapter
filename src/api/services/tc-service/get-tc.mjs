export async function getTCByCode(code) {
    const [tc_row, bc_rows] = await Promise.all([
        tcDataService.selectTCData(code),
        tcDataService.selectParentBCForTC(code)
    ]);

    if (!tc_row) throw NotFound(`TC with code="${code}" not found`);

    const tc = new TechnicalCapability(tc_row);
    bc_rows.forEach(bc => tc.addParent({ code: bc.bc_code, name: bc.bc_name }))
    return tc;
}