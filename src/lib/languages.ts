export type LanguageOption = {
  label: string;
  value: string;
  prismLanguage: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {label: 'JavaScript', value: 'JavaScript', prismLanguage: 'javascript'},
  {label: 'Python', value: 'Python', prismLanguage: 'python'},
  {label: 'Java', value: 'Java', prismLanguage: 'java'},
  {label: 'C#', value: 'C#', prismLanguage: 'csharp'},
  {label: 'C++', value: 'C++', prismLanguage: 'cpp'},
  {label: 'Go', value: 'Go', prismLanguage: 'go'},
  {label: 'Ruby', value: 'Ruby', prismLanguage: 'ruby'},
  {label: 'Rust', value: 'Rust', prismLanguage: 'rust'},
  {label: 'Kotlin', value: 'Kotlin', prismLanguage: 'kotlin'},
  {label: 'Swift', value: 'Swift', prismLanguage: 'swift'},
  {label: 'PHP', value: 'PHP', prismLanguage: 'php'},
  {label: 'TypeScript', value: 'TypeScript', prismLanguage: 'typescript'},
  {label: 'Dart', value: 'Dart', prismLanguage: 'dart'},
  {label: 'Scala', value: 'Scala', prismLanguage: 'scala'},
  {label: 'Lua', value: 'Lua', prismLanguage: 'lua'},
  {label: 'Bash', value: 'Bash', prismLanguage: 'bash'},
  {label: 'SQL', value: 'SQL', prismLanguage: 'sql'},
  {label: 'R', value: 'R', prismLanguage: 'r'},
  {label: 'MATLAB', value: 'MATLAB', prismLanguage: 'matlab'},
  {label: 'Julia', value: 'Julia', prismLanguage: 'julia'},
];

export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.map(option => option.value);
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
