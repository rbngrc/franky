import { escapeCSVCell } from '../csv';

describe('escapeCSVCell', () => {
  it('returns plain strings unchanged', () => {
    expect(escapeCSVCell('hola')).toBe('hola');
    expect(escapeCSVCell('123')).toBe('123');
    expect(escapeCSVCell('')).toBe('');
  });

  it('wraps strings containing commas in double quotes', () => {
    expect(escapeCSVCell('a,b')).toBe('"a,b"');
  });

  it('escapes double quotes by doubling them', () => {
    expect(escapeCSVCell('say "hello"')).toBe('"say ""hello"""');
  });

  it('wraps strings containing newlines in double quotes', () => {
    expect(escapeCSVCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('prefixes formula-injection characters with single quote', () => {
    expect(escapeCSVCell('=CMD("calc.exe")')).toBe("'=CMD(\"calc.exe\")");
    expect(escapeCSVCell('+SUM(A1:A2)')).toBe("'+SUM(A1:A2)");
    expect(escapeCSVCell('-1+2')).toBe("'-1+2");
    expect(escapeCSVCell('@SUM(1)')).toBe("'@SUM(1)");
    expect(escapeCSVCell('\tformula')).toBe("'\tformula");
    expect(escapeCSVCell('\rformula')).toBe("'\rformula");
  });

  it('handles combined dangerous content', () => {
    expect(escapeCSVCell('=SUM(a,b)')).toBe("'=SUM(a,b)");
  });

  it('does not prefix safe strings starting with special chars after first char', () => {
    expect(escapeCSVCell('a=b')).toBe('a=b');
    expect(escapeCSVCell('test+1')).toBe('test+1');
  });
});
