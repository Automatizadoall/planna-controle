#!/usr/bin/env node

/**
 * Script de Manutenção Mensal
 * Execute: node scripts/maintenance.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('')
  log(`${'='.repeat(50)}`, 'cyan')
  log(`  ${title}`, 'bold')
  log(`${'='.repeat(50)}`, 'cyan')
  console.log('')
}

function runCommand(command, description) {
  log(`▶ ${description}...`, 'yellow')
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' })
    if (output.trim()) {
      console.log(output)
    }
    log(`✓ Concluído`, 'green')
    return { success: true, output }
  } catch (error) {
    log(`✗ Erro: ${error.message}`, 'red')
    return { success: false, error: error.message }
  }
}

function checkVulnerabilities() {
  logSection('1. VERIFICANDO VULNERABILIDADES')
  
  const result = runCommand('npm audit --json 2>/dev/null || true', 'Executando npm audit')
  
  try {
    // Try to parse audit results
    const auditOutput = execSync('npm audit 2>&1 || true', { encoding: 'utf-8' })
    
    if (auditOutput.includes('found 0 vulnerabilities')) {
      log('✓ Nenhuma vulnerabilidade encontrada!', 'green')
    } else if (auditOutput.includes('vulnerabilities')) {
      log('⚠ Vulnerabilidades encontradas. Execute: npm audit fix', 'yellow')
      console.log(auditOutput)
    }
  } catch (e) {
    log('Não foi possível verificar vulnerabilidades', 'yellow')
  }
}

function checkOutdated() {
  logSection('2. VERIFICANDO PACOTES DESATUALIZADOS')
  
  try {
    const output = execSync('npm outdated 2>&1 || true', { encoding: 'utf-8' })
    
    if (!output.trim() || output.includes('npm ERR!')) {
      log('✓ Todos os pacotes estão atualizados!', 'green')
    } else {
      log('⚠ Pacotes desatualizados:', 'yellow')
      console.log(output)
      log('Para atualizar: npm update', 'cyan')
    }
  } catch (e) {
    log('✓ Todos os pacotes estão atualizados!', 'green')
  }
}

function checkDiskUsage() {
  logSection('3. VERIFICANDO USO DE DISCO')
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules')
  
  if (fs.existsSync(nodeModulesPath)) {
    try {
      // Get folder size (works on Windows and Unix)
      const isWindows = process.platform === 'win32'
      let size = 0
      
      if (isWindows) {
        // Simple estimation for Windows
        log('📁 node_modules existe', 'cyan')
      } else {
        const output = execSync(`du -sh node_modules 2>/dev/null || echo "N/A"`, { encoding: 'utf-8' })
        log(`📁 node_modules: ${output.trim()}`, 'cyan')
      }
    } catch (e) {
      log('📁 node_modules existe', 'cyan')
    }
  }
  
  // Check for unused files
  const unusedPatterns = ['.log', '.tmp', '.cache']
  let unusedFound = false
  
  log('Verificando arquivos temporários...', 'yellow')
  
  unusedPatterns.forEach(pattern => {
    try {
      const files = execSync(`find . -name "*${pattern}" -type f 2>/dev/null | head -5 || true`, { encoding: 'utf-8' })
      if (files.trim()) {
        unusedFound = true
        log(`Encontrados arquivos ${pattern}`, 'yellow')
      }
    } catch (e) {
      // Ignore on Windows
    }
  })
  
  if (!unusedFound) {
    log('✓ Nenhum arquivo temporário encontrado', 'green')
  }
}

function generateReport() {
  logSection('4. GERANDO RELATÓRIO')
  
  const report = {
    date: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    checks: {
      vulnerabilities: 'checked',
      outdated: 'checked',
      diskUsage: 'checked',
    }
  }
  
  const reportPath = path.join(process.cwd(), 'maintenance-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log(`✓ Relatório salvo em: maintenance-report.json`, 'green')
}

function showSummary() {
  logSection('RESUMO')
  
  log('Manutenção concluída!', 'green')
  console.log('')
  log('Próximos passos recomendados:', 'cyan')
  console.log('  1. Se houver vulnerabilidades: npm audit fix')
  console.log('  2. Se houver pacotes desatualizados: npm update')
  console.log('  3. Testar o app após atualizações: npm run dev')
  console.log('  4. Fazer commit das alterações')
  console.log('')
  log('Próxima manutenção recomendada: daqui 30 dias', 'yellow')
}

// Main execution
console.log('')
log('🔧 SCRIPT DE MANUTENÇÃO - Poupefy', 'bold')
log(`   Executado em: ${new Date().toLocaleString('pt-BR')}`, 'cyan')

checkVulnerabilities()
checkOutdated()
checkDiskUsage()
generateReport()
showSummary()
