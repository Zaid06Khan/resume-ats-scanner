export const SKILLS_TAXONOMY: string[] = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'haskell',
  // Frontend
  'react', 'next.js', 'vue', 'angular', 'svelte', 'html', 'css', 'sass',
  'tailwind', 'webpack', 'vite', 'redux', 'graphql', 'jquery', 'bootstrap',
  'styled-components', 'emotion', 'storybook', 'cypress', 'jest',
  // Backend
  'node.js', 'express', 'django', 'flask', 'spring', 'fastapi', 'rails',
  'rest api', 'microservices', 'grpc', 'nestjs', 'hono', 'laravel', 'asp.net',
  // Cloud/DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
  'github actions', 'ci/cd', 'linux', 'nginx', 'ansible', 'pulumi', 'helm',
  'cloudformation', 'vercel', 'netlify', 'heroku', 'datadog', 'prometheus',
  // Databases
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
  'sqlite', 'cassandra', 'firebase', 'supabase', 'neo4j', 'clickhouse',
  // Data/ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas',
  'numpy', 'scikit-learn', 'data analysis', 'sql', 'spark', 'hadoop',
  'tableau', 'power bi', 'looker', 'dbt', 'airflow', 'mlflow', 'hugging face',
  'langchain', 'openai', 'llm', 'rag',
  // Tools/Practices
  'git', 'agile', 'scrum', 'jira', 'figma', 'photoshop', 'bash',
  'powershell', 'excel', 'notion', 'confluence', 'slack', 'linux',
  'object-oriented programming', 'functional programming', 'tdd', 'bdd',
  // Security
  'cybersecurity', 'oauth', 'jwt', 'ssl', 'penetration testing', 'siem',
  'zero trust', 'soc', 'compliance',
  // Mobile
  'ios', 'android', 'react native', 'flutter', 'xcode', 'swift ui',
  // Business/Management
  'project management', 'leadership', 'communication', 'teamwork',
  'problem solving', 'product management', 'stakeholder management',
  'strategic planning', 'budget management', 'risk management',
  'business analysis', 'requirements gathering', 'ux design', 'a/b testing',
  // Cloud-specific
  'lambda', 'ec2', 's3', 'rds', 'sqs', 'sns', 'api gateway',
  'azure devops', 'google cloud', 'bigquery', 'cloud run',
];

export const SKILL_STEMS: Record<string, string> = {
  'reactjs': 'react',
  'react.js': 'react',
  'nodejs': 'node.js',
  'node': 'node.js',
  'nextjs': 'next.js',
  'next': 'next.js',
  'vuejs': 'vue',
  'vue.js': 'vue',
  'angularjs': 'angular',
  'postgres': 'postgresql',
  'psql': 'postgresql',
  'mongo': 'mongodb',
  'k8s': 'kubernetes',
  'kube': 'kubernetes',
  'tf': 'terraform',
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'golang': 'go',
  'ml': 'machine learning',
  'dl': 'deep learning',
  'ai': 'machine learning',
  'scss': 'sass',
  'gh actions': 'github actions',
  'cicd': 'ci/cd',
  'rest': 'rest api',
  'apis': 'rest api',
  'oop': 'object-oriented programming',
  'fp': 'functional programming',
  'gcp': 'gcp',
  'google cloud platform': 'gcp',
  'amazon web services': 'aws',
  'microsoft azure': 'azure',
};
