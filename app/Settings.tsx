import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
// Icons from lucide-react are not compatible with React Native.
// You can replace these with react-native-vector-icons or other icon libraries.
import TabNav from '../components/ui/TabNav';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'institute', label: 'Institute Details' },
    // { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'payment', label: 'Payment Settings' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your account and application preferences
        </Text>
      </View>

      {/* Tab navigation */}
      <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 'profile' && (
          <View style={styles.section}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>A</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Admin User</Text>
                <Text style={styles.profileEmail}>admin@sktutorials.com</Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Change Profile Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="Admin User"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="admin@sktutorials.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="+91 9876543210"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Position</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="Administrator"
                />
              </View>

              <View style={[styles.formGroup, styles.fullWidth]}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  defaultValue="Administrator for SK Tutorials management system."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.btnPrimary}>
                {/* Icon Save can be added here with react-native-vector-icons */}
                <Text style={styles.btnPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'institute' && (
          <View style={styles.section}>
            <View style={styles.profileHeader}>
            <View style={styles.instituteLogo}>
              {/* GraduationCap icon can be added here */}
              <Text style={styles.instituteLogoText}>🎓</Text>
            </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>SK Tutorials</Text>
                <Text style={styles.profileEmail}>Educational Institute</Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Change Institute Logo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Institute Name</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="SK Tutorials"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Institute Type</Text>
                {/* Picker is deprecated, use @react-native-picker/picker or other */}
                <Picker
                  selectedValue="coaching"
                  style={styles.picker}
                  onValueChange={(itemValue: string) => {}}
                >
                  <Picker.Item label="Coaching Institute" value="coaching" />
                  <Picker.Item label="School" value="school" />
                  <Picker.Item label="College" value="college" />
                  <Picker.Item label="University" value="university" />
                </Picker>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="contact@sktutorials.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="+91 9876543210"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.fullWidth]}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  defaultValue="123 Education Street, Knowledge Park, Mumbai, Maharashtra, 400001"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="https://www.sktutorials.com"
                  keyboardType="url"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Establishment Year</Text>
                <TextInput
                  style={styles.inputField}
                  defaultValue="2010"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.btnPrimary}>
                {/* Icon Save can be added here */}
                <Text style={styles.btnPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Other tabs like notifications, security, payment can be converted similarly */}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111827', // text-gray-900
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280', // text-gray-500
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    backgroundColor: '#3B82F6', // primary color
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 24,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  profileEmail: {
    color: '#6B7280',
    marginTop: 4,
  },
  linkText: {
    marginTop: 8,
    color: '#3B82F6',
    fontSize: 14,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formGroup: {
    width: '48%',
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#374151',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  btnPrimary: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Settings;