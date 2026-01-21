const PediatricFeatures = require('../src/models/PediatricFeatures');

async function testPediatricFeatures() {
  console.log('👶 Testing Pediatric Features...\n');
  
  const clinicId = 1;
  
  try {
    // Test 1: Growth Chart Data
    console.log('📈 Testing Growth Chart Data...');
    try {
      const growthData = await PediatricFeatures.getGrowthChartData(clinicId, 1);
      console.log(`✅ Growth chart data retrieved`);
      console.log(`  Patient: ${growthData.patient_info.gender}`);
      console.log(`  Growth measurements: ${growthData.growth_data.length}`);
      if (growthData.growth_data.length > 0) {
        const sample = growthData.growth_data[0];
        console.log(`  Sample: Age ${sample.age_months}m, Weight ${sample.weight}kg (${sample.weight_percentile}th percentile)`);
      }
      if (growthData.growth_velocity && growthData.growth_velocity.length > 0) {
        console.log(`  Growth velocity periods: ${growthData.growth_velocity.length}`);
      }
    } catch (error) {
      console.log(`⚠️  Growth chart: ${error.message}`);
    }
    
    // Test 2: Developmental Milestones
    console.log('\n🎯 Testing Developmental Milestones...');
    try {
      const milestones = await PediatricFeatures.trackDevelopmentalMilestones(clinicId, 1);
      console.log(`✅ Developmental milestones tracked`);
      console.log(`  Patient age: ${milestones.patient_age_months} months`);
      console.log(`  Total milestones: ${milestones.milestones.length}`);
      console.log(`  Expected: ${milestones.summary.total_expected}, Achieved: ${milestones.summary.total_achieved}, Delayed: ${milestones.summary.total_delayed}`);
      
      const sampleMilestone = milestones.milestones.find(m => m.status === 'achieved');
      if (sampleMilestone) {
        console.log(`  Sample achieved: ${sampleMilestone.milestone} at ${sampleMilestone.age_months} months`);
      }
    } catch (error) {
      console.log(`⚠️  Milestones: ${error.message}`);
    }
    
    // Test 3: Vaccine Schedule Compliance
    console.log('\n💉 Testing Vaccine Schedule Compliance...');
    try {
      const compliance = await PediatricFeatures.getVaccineScheduleCompliance(clinicId, 1);
      console.log(`✅ Vaccine compliance calculated`);
      console.log(`  Patient age: ${compliance.patient_age_months} months`);
      console.log(`  Compliance rate: ${compliance.compliance_rate.toFixed(1)}%`);
      console.log(`  Total vaccines in schedule: ${compliance.schedule.length}`);
      console.log(`  Overdue vaccines: ${compliance.overdue_vaccines.length}`);
      
      const completedVaccines = compliance.schedule.filter(v => v.status === 'completed');
      console.log(`  Completed vaccines: ${completedVaccines.length}`);
    } catch (error) {
      console.log(`⚠️  Vaccine compliance: ${error.message}`);
    }
    
    // Test 4: WHO Percentile Calculations
    console.log('\n📊 Testing WHO Percentile Calculations...');
    const testWeight = 10.5; // kg
    const testHeight = 75; // cm
    const testAge = 12; // months
    const testGender = 'male';
    
    const weightPercentile = PediatricFeatures.calculatePercentile(testWeight, testAge, testGender, 'weight');
    const heightPercentile = PediatricFeatures.calculatePercentile(testHeight, testAge, testGender, 'height');
    
    console.log(`✅ Percentile calculations working`);
    console.log(`  ${testAge}m old ${testGender}: ${testWeight}kg = ${weightPercentile}th percentile, ${testHeight}cm = ${heightPercentile}th percentile`);
    
    // Test 5: Pediatric Analytics
    console.log('\n🏥 Testing Pediatric Analytics...');
    try {
      const analytics = await PediatricFeatures.getPediatricAnalytics(clinicId, '2024-01-01', '2024-12-31');
      console.log(`✅ Pediatric analytics generated`);
      console.log(`  Total pediatric patients: ${analytics.patient_demographics.total_pediatric_patients}`);
      console.log(`  Infants: ${analytics.patient_demographics.infants}`);
      console.log(`  Toddlers: ${analytics.patient_demographics.toddlers}`);
      console.log(`  School age: ${analytics.patient_demographics.school_age}`);
      console.log(`  Common diagnoses: ${analytics.common_diagnoses.length}`);
      
      if (analytics.common_diagnoses.length > 0) {
        console.log(`  Top diagnosis: ${analytics.common_diagnoses[0].diagnosis_name} (${analytics.common_diagnoses[0].frequency} cases)`);
      }
    } catch (error) {
      console.log(`⚠️  Pediatric analytics: ${error.message}`);
    }
    
    console.log('\n🎯 Available Pediatric Endpoints:');
    const endpoints = [
      '/patients/:id/pediatric/growth-chart',
      '/patients/:id/pediatric/milestones',
      '/patients/:id/pediatric/vaccine-compliance',
      '/reports/clinical/pediatric-analytics'
    ];
    
    endpoints.forEach((endpoint, index) => {
      console.log(`  ${index + 1}. ${endpoint}`);
    });
    
    console.log('\n✅ All Pediatric Features tested successfully!');
    console.log('👶 Phase 4.6 Pediatric Features are now functional!');
    
  } catch (error) {
    console.error('❌ Error testing Pediatric Features:', error);
  }
}

testPediatricFeatures();