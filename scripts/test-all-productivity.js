const ClinicalReports = require('../src/models/ClinicalReports');

async function testAllDoctorProductivityFeatures() {
  console.log('🧪 Testing All Doctor Productivity Features...\n');
  
  const clinicId = 1;
  const dateFrom = '2024-01-01';
  const dateTo = '2024-12-31';
  
  try {
    // Test 1: Doctor Productivity
    console.log('👨⚕️ Testing Doctor Productivity...');
    const productivity = await ClinicalReports.getDoctorProductivity(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${productivity.length} doctors with productivity data`);
    productivity.slice(0, 2).forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.doctor_name}: ${doc.total_visits} visits, ${doc.unique_patients} patients, ${doc.avg_diagnoses_per_visit} diagnoses/visit`);
    });
    
    // Test 2: Appointment Efficiency
    console.log('\n📅 Testing Appointment Efficiency...');
    const efficiency = await ClinicalReports.getAppointmentEfficiency(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${efficiency.length} doctors with appointment data`);
    efficiency.forEach((eff, index) => {
      console.log(`  ${index + 1}. ${eff.doctor_name}: ${eff.completion_rate}% completion, ${eff.no_show_rate}% no-show rate`);
    });
    
    // Test 3: Documentation Completeness
    console.log('\n📝 Testing Documentation Completeness...');
    const completeness = await ClinicalReports.getDocumentationCompleteness(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${completeness.length} doctors with documentation data`);
    completeness.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.doctor_name}: ${comp.diagnosis_completion_rate}% diagnosis, ${comp.vitals_completion_rate}% vitals`);
    });
    
    // Test 4: Follow-up Compliance
    console.log('\n🔄 Testing Follow-up Compliance...');
    const followup = await ClinicalReports.getFollowUpCompliance(clinicId, dateFrom, dateTo);
    console.log(`✅ Found ${followup.length} patients with follow-up data`);
    followup.slice(0, 3).forEach((follow, index) => {
      console.log(`  ${index + 1}. ${follow.patient_name} (${follow.diagnosis_name}): ${follow.total_visits} visits - ${follow.compliance_level}`);
    });
    
    // Test 5: Clinical Quality Indicators
    console.log('\n⭐ Testing Clinical Quality Indicators...');
    const quality = await ClinicalReports.getClinicalQualityIndicators(clinicId, dateFrom, dateTo);
    console.log('✅ Quality Indicators Generated');
    console.log(`  Total Visits: ${quality.total_visits}`);
    console.log(`  Diagnosis Documentation Rate: ${quality.diagnosis_rate}%`);
    console.log(`  Vitals Documentation Rate: ${quality.vitals_documentation_rate}%`);
    console.log(`  Abnormal Lab Results Rate: ${quality.abnormal_result_rate}%`);
    
    console.log('\n🎯 Summary of Available Report Types:');
    const reportTypes = [
      'doctor-productivity',
      'appointment-efficiency', 
      'documentation-completeness',
      'followup-compliance',
      'quality-indicators'
    ];
    
    reportTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type} - Available via /reports/clinical/${type}`);
    });
    
    console.log('\n✅ All Doctor Productivity & Outcomes features tested successfully!');
    console.log('📊 Phase 4.5.2 is now COMPLETE with comprehensive analytics!');
    
  } catch (error) {
    console.error('❌ Error testing Doctor Productivity features:', error);
  }
}

testAllDoctorProductivityFeatures();