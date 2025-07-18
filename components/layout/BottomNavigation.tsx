import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";

interface BottomNavigationProps {
  navigation?: any;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ navigation }) => {
  const navItems = [
    {
      name: "Dashboard",
      icon: <MaterialIcons name="dashboard" size={24} color="#374151" />,
      route: "/app/Dashboard",
    },
    {
      name: "Students",
      icon: <FontAwesome5 name="user-graduate" size={24} color="#374151" />,
      route: "Students",
    },
    {
      name: "Fees",
      icon: <MaterialIcons name="credit-card" size={24} color="#374151" />,
      route: "Fees",
    },
    {
      name: "Attendance",
      icon: <MaterialIcons name="event-available" size={24} color="#374151" />,
      route: "Attendance",
    },
    {
      name: "Performance",
      icon: <MaterialIcons name="trending-up" size={24} color="#374151" />,
      route: "Performance",
    },
    // {
    //   name: "Courses",
    //   icon: <MaterialIcons name="book" size={24} color="#374151" />,
    //   route: "Courses",
    // },
    {
      name: "Settings",
      icon: <Feather name="settings" size={24} color="#374151" />,
      route: "Settings",
    },
  ];

  const handleNavigate = (route: string) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(route);
    } else {
      console.warn(`Navigation to ${route} not implemented`);
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handleNavigate(item.route)}
          accessibilityLabel={`Navigate to ${item.name}`}
        >
          {item.icon}
          <Text style={styles.navText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6", // gray-100
    borderTopWidth: 1,
    borderTopColor: "#d1d5db", // gray-300
    paddingVertical: 8,
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#374151", // gray-700
    marginTop: 2,
  },
});

export default BottomNavigation;
